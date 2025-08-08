import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginSecurity from 'eslint-plugin-security';
import pluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: [
      '.dependabot/',
      '.git/',
      '.vscode/',
      'node_modules/',
      'public/',
      '.next/',
      '*.js',
      'next-env.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['tsconfig.json', 'extension/tsconfig.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      security: pluginSecurity,
      import: pluginImport,
    },
    rules: {
      // Custom rules
      '@typescript-eslint/naming-convention': [
        'error',
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
      '@typescript-eslint/no-misused-promises': 1,
      'react/display-name': 1,
      'arrow-body-style': ['error', 'as-needed'],
      'no-prototype-builtins': 'error',
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
  },
];
