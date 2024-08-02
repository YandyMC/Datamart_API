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
		SELECT YEAR(dim_tiempo.fecha) AS año
		FROM dim_tiempo
		GROUP BY YEAR(dim_tiempo.fecha)
		ORDER BY YEAR(dim_tiempo.fecha)
	`

	try {
		const anios = await client.query(query)
		return new Response(JSON.stringify({ anios }))
	} catch (err) {
		return new Response(JSON.stringify(err.message))
	}
}
