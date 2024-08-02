/** @type {import("prettier").Config} */

export default {
  semi: false,
  tabWidth: 2,
  useTabs: true,
  endOfLine: 'lf',
  printWidth: 100,
  singleQuote: false,
  arrowParens: 'always',
  trailingComma: 'es5',
  quoteProps: 'consistent',
  plugins: [
    'prettier-plugin-astro',
    'prettier-plugin-tailwindcss',
  ],
  overrides: [
    {
      files: ['*.json', '*.md', '*.toml', '*.yml'],
      options: {
        useTabs: false
      }
    },
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
}
