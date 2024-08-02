import sql from "msnodesqlv8"
import { connectionString } from "./config"

const client = {
	query: async (query) => {
		try {
			const data = await new Promise((resolve, reject) => {
				sql.query(connectionString, query, (err, rows) => {
					if (err) reject(err)
					else resolve(rows)
				})
			})
			return data
		} catch (error) {
			console.error(error)
		}
	},
}

export { client }
