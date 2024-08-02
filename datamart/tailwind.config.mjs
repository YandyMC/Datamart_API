/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,md,mdx,ts}"],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: ["aqua"],
	},
	plugins: [require("daisyui"), require("tailwind-scrollbar")],
}
