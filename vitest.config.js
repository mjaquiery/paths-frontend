'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var config_1 = require('@nuxt/test-utils/config');
exports.default = (0, config_1.defineVitestConfig)({
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', 'playwright-test/**'],
  },
});
