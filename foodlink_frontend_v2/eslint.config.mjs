import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginNext from 'eslint-plugin-next';

export default [
  // Global settings for JavaScript files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // Match JS, JSX, TS, and TSX files
    languageOptions: {
      sourceType: 'module', // Set module for ES6+ modules
      ecmaFeatures: {
        jsx: true, // Enable JSX support
      },
    },
  },

  // Node globals for Node.js environment
  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // Enable recommended rules from eslint-plugin-react and eslint-plugin-next
  pluginJs.configs.recommended,
  {
    plugins: {
      react: pluginReact,
      next: pluginNext,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended', // Use React specific linting rules
      'plugin:next/recommended', // Use Next.js specific linting rules
    ],
    parserOptions: {
      ecmaVersion: 2020, // Allow modern JS features
      sourceType: 'module', // Enable ES module support
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing
      },
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
];
