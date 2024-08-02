import { Session } from "../../../sessions/main"

export const POST = async ({ cookies }) => {
	const sessionID = cookies.get("session").value

	try {
		// session still exists || success
		const message = Session.destroy(sessionID)

		if (message === "session still exists") {
			return new Response(JSON.stringify({ error: message }, { status: 400 }))
		}

		return new Response(JSON.stringify({ message: "success" }))
	} catch (err) {
		return new Response(JSON.stringify(err.message))
	}
}
