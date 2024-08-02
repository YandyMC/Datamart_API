import { Session } from "./sessions/main"

interface Request {
	locals: any
	cookies: any
}

export function onRequest({ locals, cookies }: Request, next: any) {
	const session = cookies.get("session")

	if (!session) {
		locals.session = null
		// locals.session.data = null
		return next()
	}

	let uuid = session.value
	const sessionObj = Session.createIfAbsent(uuid)
	uuid = sessionObj.uuid
	cookies.set("session", uuid, { path: "/" })

	locals.session = sessionObj
	// console.log("middleware->sessObj:", sessionObj)  //DEBUG

	next()
}
