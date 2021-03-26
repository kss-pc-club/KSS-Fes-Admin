module.exports = {
  plugins: ['simple-import-sort'],
  extends: ['prettier', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: false,
        singleQuote: true,
      },
    ],
    'simple-import-sort/imports': 'error',
  },
  parserOptions: {
    sourceType: 'module',
  },
}
