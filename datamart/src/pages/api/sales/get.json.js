import { client } from "../../../database/client"

export const GET = async ({ cookies, request }) => {
	const session = cookies.get("session")
	let sessionID = null

	if (session) sessionID = session.value

	if (!session) {
		return new Response(JSON.stringify({ error: "Inicia sesión para obtener los datos" }), {
			status: 400,
		})
	}

	const url = new URL(request.url)
	const params = new URLSearchParams(url.search)

	// Número de veces que se ha redibujado la tabla
	const redrawn = Number(params.get("draw")) || 0
	// Fila inicial desde la que se obtendrán los registros
	const initialRow = params.get("initialRow") || 0
	// Número de filas totales que se obtendrán de la consulta
	const rowsNumber = params.get("rowsNumber") || 10

	// Parámetro de búsqueda para filtrar los datos en la consulta
	let searchValue = params.get("searchValue") || ""

	//searchValue sin  espacion en blanco al inicio o al final
	searchValue = searchValue.trim()

	// Número total de registros que se han guardado en caché en el cliente
	const cachedTotalRecords = Number(params.get("cachedTotalRecords")) || 0
	// Número total de registros filtrados que se han guardado en caché en el cliente
	const cachedTotalRecordsFiltered = Number(params.get("cachedTotalRecordsFiltered")) || 0

	// Parámetros para ordenar los datos de la consulta
	const sortColumn = params.get("sortColumn") || "id_ventas"
	const sortDirection = params.get("sortDirection") || "asc"

	const year = params.get("year") || ""
	const product = params.get("product") || ""

	const errors = []

	if (isNaN(initialRow)) errors.push({ initialRow: "must be a number" })
	if (isNaN(rowsNumber)) errors.push({ rowsNumber: "must be a number" })

	if (Number(initialRow) < 0) {
		errors.push({ initialRow: "must be greater than or equal to 0" })
	}

	if (Number(rowsNumber) < 1) {
		errors.push({ rowsNumber: "must be greater than or equal to 1" })
	}

	if (rowsNumber > 500) {
		errors.push({ rowsNumber: "must be less than or equal to 500" })
	}

	if (errors.length >= 1) {
		return new Response(JSON.stringify({ errors }), { status: 400 })
	}

	const totalRecordsQuery = "SELECT COUNT(*) AS totalRows FROM ventas"

	let totalRecordsFilteredQuery = `
		SELECT COUNT(*) as totalFilteredRows FROM ventas
		INNER JOIN DIM_CLIENTE c ON ventas.id_cliente = c.id_cliente
		INNER JOIN DIM_CUOTA ct ON ventas.id_cuota = ct.id_cuota
		INNER JOIN DIM_TIEMPO t ON ventas.id_tiempo = t.id_tiempo
	`

	let salesQuery = `
		SELECT
			ventas.id_ventas,
			--- initial part --------------------------------------------------
			t.ano AS anio,  DATEPART(QUARTER, t.fecha) AS trimestre,
			DATENAME(MONTH, t.fecha) AS mes, DAY(t.fecha) AS dia,
			c.nombre_cliente, c.tipo_cliente, ct.nombre_producto AS producto,
			--- sums ----------------------------------------------------------
			SUM(ct.cantidad_producto) AS sum_cantidad_producto,
			SUM(ct.iva_cuota) AS sum_iva_cuota,
			SUM(ct.iva_vigente_cuota) AS sum_iva_vigente_cuota,
			SUM(ct.precio_producto) AS sum_precio_producto,
			SUM(ct.total_cuota) AS sum_total_cuota
			--------------------------------------------------------------------
		FROM ventas
		INNER JOIN DIM_CLIENTE c ON ventas.id_cliente = c.id_cliente
		INNER JOIN DIM_CUOTA ct ON ventas.id_cuota = ct.id_cuota
		INNER JOIN DIM_TIEMPO t ON ventas.id_tiempo = t.id_tiempo
	`

	if (searchValue !== "" || product !== "" || year !== "") {
		salesQuery += " WHERE "
		totalRecordsFilteredQuery += " WHERE "

		if (searchValue !== "") {
			//salesQuery += `CONTAINS(c.nombre_cliente, '${searchValue}')`
			//totalRecordsFilteredQuery += `CONTAINS(c.nombre_cliente, '${searchValue}')`
			salesQuery += `c.nombre_cliente LIKE '%${searchValue}%'`
			totalRecordsFilteredQuery += `c.nombre_cliente LIKE '%${searchValue}%'`
		}

		if (product !== "") {
			if (searchValue !== "") {
				salesQuery += " AND "
				totalRecordsFilteredQuery += " AND "
			}

			salesQuery += `ct.nombre_producto LIKE '%${product}%'`
			totalRecordsFilteredQuery += `ct.nombre_producto LIKE '%${product}%'`
		}

		if (year !== "") {
			if (searchValue !== "" || product !== "") {
				salesQuery += " AND "
				totalRecordsFilteredQuery += " AND "
			}
			salesQuery += `t.ano = '${year}'`
			totalRecordsFilteredQuery += `t.ano = '${year}'`
		}
	}

	salesQuery += `
		GROUP BY
			--------------------------------------------------------------------
			ventas.id_ventas,
			t.ano,  DATEPART(QUARTER, t.fecha),
			DATENAME(MONTH, t.fecha), DAY(t.fecha),
			c.nombre_cliente, c.tipo_cliente, ct.nombre_producto
			--------------------------------------------------------------------
		ORDER BY ventas.id_ventas
		OFFSET ${initialRow} ROWS
		FETCH NEXT ${rowsNumber} ROWS ONLY;
	`

	let totalRows = cachedTotalRecords

	if (redrawn === 1) {
		// Si es la primera vez que se dibuja la tabla
		const totalRecordsResult = await client.query(totalRecordsQuery)
		totalRows = totalRecordsResult[0].totalRows
	}

	let ventas = await client.query(salesQuery)
	console.log(ventas)
	// Ordenar los datos localmente
	if (!typeof ventas === 'undefined') {
		ventas = ventas.sort((a, b) => {
			if (sortDirection === "asc") {
				return a[sortColumn] > b[sortColumn] ? 1 : -1
			} else {
				return a[sortColumn] < b[sortColumn] ? 1 : -1
			}
		})
	}

	// Número total de registros filtrados en la consulta SQL
	let totalRowsFiltered = cachedTotalRecordsFiltered || totalRows

	if (searchValue !== "" || product !== "" || year !== "") {
		const totalRecordsFilteredResult = await client.query(totalRecordsFilteredQuery)
		//if (!typeof ventas === 'undefined') {
		totalRowsFiltered = totalRecordsFilteredResult[0].totalFilteredRows
		//}
	} else {
		totalRowsFiltered = totalRows
	}

	return new Response(
		JSON.stringify({
			draw: redrawn,
			recordsTotal: totalRows,
			recordsFiltered: totalRowsFiltered,
			data: ventas,
		})
	)
}
