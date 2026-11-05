import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: { globals: globals.browser },
    rules: {
      // Empty catches guard optional browser APIs (speech, storage) on purpose.
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
  },
  {
    // The simulation moves to the server later, so it can't touch the page or the renderer.
    files: ['src/sim/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['three', 'three/*', '../*'] }],
      'no-restricted-globals': ['error', 'document', 'window', 'localStorage'],
    },
  },
  prettier,
);
