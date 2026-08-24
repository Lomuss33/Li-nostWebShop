import withNuxt from './.nuxt/eslint.config.mjs'
// Prettier intentionally formats Vue void elements as self-closing tags.
// Keep ESLint and the repository formatter consistent.
export default withNuxt({
  rules: {
    'vue/html-self-closing': 'off',
  },
})
