import bcryptjs from "bcryptjs"

export const POST = async ({ request }) => {
	const data = await request.formData()
	const rawPassword = data.get("rawPassword")

	const salt = await bcryptjs.genSalt(10)
	const secPassword = await bcryptjs.hash(rawPassword, salt)

	if (!secPassword) {
		return new Response(JSON.stringify({ error: "Error al encriptar la contraseña" }))
	}

	return new Response(JSON.stringify({ secPassword }))
}
