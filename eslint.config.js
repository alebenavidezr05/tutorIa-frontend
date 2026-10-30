// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/** Reglas no negociables del proyecto (§2), vigiladas por el linter. */
const prohibicionesComunes = [
  {
    selector: 'TryStatement',
    message: 'Prohibido try/catch: los errores HTTP se centralizan en errorInterceptor.',
  },
  {
    selector: "MemberExpression[property.name='innerHTML']",
    message: 'Prohibido innerHTML: el contenido se renderiza como texto con plantillas.',
  },
  {
    selector: "MemberExpression[property.name=/^bypassSecurityTrust/]",
    message: 'Solo FormulaKatexPipe y YoutubeEmbedUrlPipe pueden usar bypassSecurityTrust*.',
  },
  {
    selector: "MemberExpression[object.name=/^(localStorage|sessionStorage)$/]",
    message: 'No se guardan datos en el almacenamiento del navegador.',
  },
  {
    selector: "CallExpression[callee.name='catchError']",
    message: 'catchError solo se usa en errorInterceptor.',
  },
];

module.exports = defineConfig([
  { ignores: ['dist/**', '.angular/**', 'coverage/**', 'node_modules/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-restricted-syntax': ['error', ...prohibicionesComunes],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common/http',
              importNames: ['HttpClient'],
              message: 'HttpClient solo se usa en core/api.',
            },
          ],
        },
      ],
    },
  },
  {
    // Capa HTTP: único lugar con HttpClient.
    files: ['src/app/core/api/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // El interceptor de errores es el único que puede usar catchError.
    files: ['src/app/core/http/error.interceptor.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...prohibicionesComunes.filter((r) => !r.selector.includes('catchError')),
      ],
    },
  },
  {
    // Las dos excepciones documentadas a bypassSecurityTrust* (§2.9).
    files: ['src/app/shared/pipes/formula-katex.pipe.ts', 'src/app/shared/pipes/youtube-embed-url.pipe.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...prohibicionesComunes.filter((r) => !r.selector.includes('bypassSecurityTrust')),
      ],
    },
  },
  {
    // Las pruebas pueden usar HttpClient de prueba y simular almacenamiento.
    files: ['src/**/*.spec.ts'],
    rules: { 'no-restricted-imports': 'off', 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-any': 'error',
    },
  },
]);
