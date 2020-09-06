module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['.dependabot/', '.git/', '.vscode/', 'node_modules/', 'public/'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
  },
  globals: {
    gapi: 'writable',
  },
  plugins: [
    '@typescript-eslint',
    '@typescript-eslint/tslint',
    'import',
    'react',
    'security',
    'react-hooks',
  ],
  rules: {
    'import/no-unresolved': [2, { ignore: ['gapi'] }],
    '@typescript-eslint/camelcase': 0, // Triggers on external APIs
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/naming-convention': [
      'error',
      // Enforce that boolean variables are prefixed with an allowed verb
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will', 'does', 'was', 'were'],
      },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-regexp-exec': 0,
    '@typescript-eslint/require-await': 0,
    '@typescript-eslint/unbound-method': 0,
    // NOTE: These no-unsafe-foo flags are needed due to the google api not having types
    '@typescript-eslint/no-unsafe-assignment': 1,
    '@typescript-eslint/no-unsafe-member-access': 1,
    '@typescript-eslint/no-unsafe-call': 1,
    '@typescript-eslint/no-unsafe-return': 1,
    'arrow-body-style': ['error', 'as-needed'],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default-member': 0,
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
    'import/no-named-as-default': 'error',
    'no-prototype-builtins': 'error',
    'no-sparse-arrays': 0,
    'no-useless-escape': 'error',
    'object-shorthand': 'error',
    'prefer-rest-params': 0, // not needed
    'react/display-name': 0,
    'react/no-unknown-property': 0, // Slow and not needed
    'react/prop-types': 0,
    'security/detect-object-injection': 0,
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
    react: { version: 'detect' },
  },
};
