import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Color literals live in src/styles/tokens.js and nowhere else. These selectors
// fail the lint on any string, template chunk or JSX attribute that spells a
// hex color or an rgba() outside that file.
const COLOR_LITERALS = [
  {
    selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
    message: 'Use a token from src/styles/tokens.js (C.gold, white(0.3), alpha(C.red, 0.1)) instead of a hex literal.',
  },
  {
    selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]',
    message: 'Use a token from src/styles/tokens.js instead of a hex literal in a template string.',
  },
  {
    selector: 'Literal[value=/rgba?\\(/]',
    message: 'Use alpha()/white()/black() from src/styles/tokens.js instead of an rgba() literal.',
  },
  {
    selector: 'TemplateElement[value.raw=/rgba?\\(/]',
    message: 'Use alpha()/white()/black() from src/styles/tokens.js instead of an rgba() literal in a template string.',
  },
];

export default [
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, ...globals.es2024 },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      // A shadowed import silently changes what a style points at (see the
      // `meta` incident in the token PR); shadowing is an error here.
      'no-shadow': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-restricted-syntax': ['error', ...COLOR_LITERALS],
      // React Compiler lints: real findings, but pre-existing; visible, not blocking.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    // The token module is the one place a color may be spelled out.
    files: ['src/styles/tokens.js', 'eslint.config.js'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.test.{js,jsx}', 'tests/**', 'vitest.setup.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
