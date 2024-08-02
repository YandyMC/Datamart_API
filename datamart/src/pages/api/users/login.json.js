import bcryptjs from "bcryptjs"
import { client } from "../../../database/client"
import { Session } from "../../../sessions/main"

export const POST = async ({ cookies, request }) => {
	const session = cookies.get("session")
	let sessionID = null

	if (session) sessionID = session.value
	// const sessionID = cookies.get("session").value

	const data = await request.formData()

	const username = data.get("username")
	const password = data.get("password")

	const query = "SELECT * FROM usuarios"

	try {
		const dbUsers = await client.query(query)

		// recorrer la lista de usuarios obtenidos de la base de datos y comparar la contraseña
		// si el usuario no existe, se retorna un mensaje de error
		// si el usuario y la contraseña coinciden, se crea o actualiza la sesión
		// si no, se retorna un mensaje de error

		const user = dbUsers.find((user) => {
			return user.USERNAME === username
		})

		if (!user) {
			return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
				status: 400,
			})
		}

		const isPasswordValid = await bcryptjs.compare(password, user.PASSWORD)

		if (!isPasswordValid) {
			return new Response(JSON.stringify({ error: "Datos incorrectos" }), {
				status: 400,
			})
		}

		if (!user.IS_ACTIVE) {
			return new Response(JSON.stringify({ error: "Usuario inactivo" }), {
				status: 400,
			})
		}

		const session = Session.createIfAbsent(sessionID)
		cookies.set("session", session.uuid, { path: "/" })
		session.setData("username", user.USERNAME)
		session.setData("fname", user.FNAME)
		session.setData("lname", user.LNAME)

		return new Response(JSON.stringify({ message: "success" }))
	} catch (err) {
		return new Response(JSON.stringify(err.message))
	}
}
