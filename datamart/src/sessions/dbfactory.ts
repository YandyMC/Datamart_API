import type { DBInterface } from "./types"
import { SQLiteDB } from "./backends/sqlite"

export function dbFactory(): DBInterface {
	return new SQLiteDB()
}
