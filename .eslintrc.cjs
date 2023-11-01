module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['plugin:prettier/recommended'],
  overrides: [
    {
      files: ['*.cjs', '*.mjs', '*.js'],
      extends: ['plugin:prettier/recommended'], // standard would be extra unneeded dep
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['standard-with-typescript', 'plugin:prettier/recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: { project: './tsconfig.json' },
      rules: {
        // Make TypeScript ESLint less strict.
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/no-dynamic-delete': 'off',
      },
    },
  ],
}
