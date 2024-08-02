const path = require("path")

export default {
	plugins: {
		"postcss-import": {},
		"tailwindcss/nesting": "postcss-nesting",
		"tailwindcss": {
			config: path.join(__dirname, "tailwind.config.mjs"),
		},
		"autoprefixer": {},
	},
}
