module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  plugins: ['import', 'jsx-a11y', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Prettier integration
    'prettier/prettier': ['warn', {
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
    }],
    
    // Best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'warn',
    'no-var': 'error',
    
    // Modern JavaScript
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'object-shorthand': 'warn',
    
    // Import organization
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'never',
    }],
    
    // Accessibility
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    '**/*.min.js',
    'public/',
    'vendor/',
    'frontend/js/dist/',
    'frontend/dist/',
    'backend/dist/',
  ],
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Scripts de utilities y tools pueden usar console
      files: ['scripts/**/*.js', 'tools/**/*.js', 'config/**/*.js'],
      rules: {
        'no-console': 'off',
        'no-undef': 'warn', // Legacy scripts pueden tener globals
      },
    },
    {
      // Archivos de desarrollo pueden usar console
      files: ['**/*.dev.js', '**/*-dev.js', 'frontend/scripts/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Logger utility necesita console internamente
      files: ['**/logger.js', '**/utils/logger.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
