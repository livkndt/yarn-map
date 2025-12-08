module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  plugins: [],
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    'dist',
    'build',
    'coverage',
    '*.config.js',
  ],
};
