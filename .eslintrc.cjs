module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['import', 'promise'],
  rules: {
    'no-console': 'off',
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] }
    ]
  }
};
