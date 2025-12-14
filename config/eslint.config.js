const prettierConfig = require('eslint-config-prettier');
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginJsxA11y = require('eslint-plugin-jsx-a11y');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginStorybook = require('eslint-plugin-storybook');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
      'public/',
      'vendor/',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/lighthouse-report*',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    plugins: {
      import: eslintPluginImport,
      'jsx-a11y': eslintPluginJsxA11y,
      prettier: eslintPluginPrettier,
      storybook: eslintPluginStorybook,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // Mejor logging - permitir console.info para logs de servicio
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // Variables y scope
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-shadow': 'warn',

      // ES6+ best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'quote-props': ['error', 'as-needed'],
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
      ],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',

      // Async/Await rules
      'require-await': 'warn',
      'no-return-await': 'error',
      'no-async-promise-executor': 'error',
      'prefer-promise-reject-errors': 'error',

      // Error handling
      'no-throw-literal': 'error',
      'no-useless-catch': 'error',

      // Code quality
      'no-param-reassign': ['warn', { props: false }],
      complexity: ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-lines-per-function': [
        'warn',
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-nested-callbacks': ['warn', { max: 3 }],

      // Security best practices
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Import organization
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',

      // Accessibility (para código frontend)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
    },
  },
  // Config para archivos de test
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js', '**/__tests__/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'import/order': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
    },
  },
  // Config para archivos de configuración
  {
    files: ['**/*.config.js', '**/config/**/*.js'],
    rules: {
      'no-console': 'off',
      'import/order': 'off',
    },
  },
  // Config para scripts
  {
    files: ['**/scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      'max-lines-per-function': 'off',
    },
  },
];
