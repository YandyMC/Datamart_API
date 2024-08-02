import { randomUUID } from "node:crypto"
import type { DBInterface, DBSessionRow, SessionInterface } from "./types"
import { dbFactory } from "./dbfactory"

interface DataKey {
	[key: string]: string | undefined
}

const database: DBInterface = dbFactory()

// Class based interface
// Was previously function based, but this works better than
// passing the session UUID with every call

// This could be improved by adding meaningful return values
// instead of "undefined"
export class Session implements SessionInterface, DBSessionRow {
	private db: DBInterface

	id: number
	uuid: string
	timeLastSeen: number | undefined
	data: object

	constructor(uuid: string) {
		this.db = dbFactory()

		// GET. If null, create new
		let dbRow = this.db.get(uuid)
		if (dbRow == null) {
			// New one should use NEW UUID,
			// NOT THE USER SUPPLIED ONE
			const newUUID = randomUUID()
			this.db.create(newUUID, {})
			dbRow = this.db.get(newUUID)
		}

		// If this is undefined right after we created it,
		// something very bad probably happened*. It's very unlikely
		// to happen, so I'll deal with it by crashing the program
		// *Assuming the DB backend is bug-free
		if (dbRow == null) {
			console.log("FATAL DISK ERROR WHILE READING DATABASE")
			console.log("Ending Process...")
			process.exit()
		}

		this.id = dbRow.id
		this.uuid = dbRow.uuid
		this.timeLastSeen = dbRow.timeLastSeen
		this.data = dbRow.data || {}
	}

	static create(): Session {
		// The constructor will now create a new session anyway,
		// so let's just call the constructor with a custom uuid
		const uuid = randomUUID()
		return new Session(uuid)
	}

	static createIfAbsent(uuid: string): Session {
		// Logic for creating if absent has been moved to the
		// constructor. So now we just call the constructor
		return new Session(uuid)
	}

	static get(uuid: string): Session | undefined {
		// Same story as create() and createIfAbsent()
		return new Session(uuid)
	}

	static getAll(): DBSessionRow[] | undefined {
		return database.getAll()
	}

	getData(key: string): string | undefined {
		return (this.data as DataKey)[key]
	}

	setData(key: string, data: string | number): undefined {
		;(this.data as DataKey)[key] = String(data)
		this.db.update(this.uuid, this.data)
	}

	static destroy(uuid: string): string {
		database.remove(uuid)

		// revisar si la session existe
		const session = database.get(uuid)
		if (session) return "session still exists"

		return "success"
	}
}
