module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'plugin:ante/recommended',
    'plugin:ante/style'
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true
    },
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: [
    'ante'
  ]
};
