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
    'plugin:security/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['.dependabot/', '.git/', '.vscode/', 'node_modules/', 'public/', '*.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'extension/tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', '@typescript-eslint/tslint', 'import', 'react', 'security'],
  rules: {
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
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-unsafe-argument': 0,
    '@typescript-eslint/unbound-method': 1,
    'react/display-name': 1,
    'arrow-body-style': ['error', 'as-needed'],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'no-prototype-builtins': 'error',
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
    'no-case-declarations': 0,
    'no-useless-escape': 'error',
    'object-shorthand': 'error',
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'security/detect-object-injection': 0,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
    react: { version: 'detect' },
  },
};
