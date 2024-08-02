import { client } from "../../../database/client"

export const GET = async ({ cookies }) => {
	const session = cookies.get("session")
	let sessionID = null

	if (session) sessionID = session.value
	// const sessionID = cookies.get("session").value

	if (!session) {
		return new Response(JSON.stringify({ error: "Inicia sesión para obtener los datos" }), {
			status: 400,
		})
	}

	const query = `
		SELECT nombre_producto FROM dim_cuota
		GROUP BY nombre_producto ORDER BY nombre_producto;
	`

	try {
		const productos = await client.query(query)
		return new Response(JSON.stringify({ productos }))
	} catch (err) {
		return new Response(JSON.stringify(err.message))
	}
}
