import { Session } from "../../../sessions/main"

const TENANT_ID = import.meta.env.TENANT_ID
const POWERBI_CLIENT_ID = import.meta.env.POWERBI_CLIENT_ID
const POWERBI_CLIENT_SECRET = import.meta.env.POWERBI_CLIENT_SECRET
const POWERBI_RESOURCE_URI = import.meta.env.POWERBI_RESOURCE_URI
const POWERBI_USERNAME = import.meta.env.POWERBI_USERNAME
const POWERBI_PASSWORD = import.meta.env.POWERBI_PASSWORD

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

	function convertToUnixTime(date) {
		return Math.floor(date.getTime() / 1000)
	}

	const dateNow = new Date()
	const currentDate = convertToUnixTime(dateNow)

	// Obtener los detalles de la sesión actual
	const sessionData = Session.get(sessionID)
	const currentToken = sessionData.getData("token") || null
	const expiresOn = sessionData.getData("expires_on") || currentDate
	// console.log('session:', sessionData);

	// Revisar si el token existe o no es nulo
	if (currentToken) {
		// Si el token no ha expirado, retornar el token actual
		if (expiresOn >= currentDate) {
			return new Response(
				JSON.stringify({
					token: currentToken,
					expires_on: expiresOn,
				})
			)
		}
	}

	// Si el token ha expirado, obtener un nuevo token
	const POWERBI_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`

	// obtener token de acceso de powerbi
	const response = await fetch(POWERBI_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "password",
			client_id: POWERBI_CLIENT_ID,
			client_secret: POWERBI_CLIENT_SECRET,
			resource: POWERBI_RESOURCE_URI,
			username: POWERBI_USERNAME,
			password: POWERBI_PASSWORD,
		}),
	})

	if (!response.ok) {
		return new Response("Error al obtener token de acceso", { status: 500 })
	}

	const data = await response.json()
	// console.log(data)

	sessionData.setData("token", data.access_token)
	sessionData.setData("expires_on", data.expires_on)

	return new Response(
		JSON.stringify({
			token: data.access_token,
			expires_on: data.expires_on,
		}),
		{ status: 200 }
	)
}
