"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var apiClient_1 = require("../generated/apiClient");
(0, vitest_1.describe)('generated api client', function () {
    (0, vitest_1.it)('contains OpenAPI operation for listing paths', function () {
        (0, vitest_1.expect)(typeof apiClient_1.listPaths).toBe('function');
    });
    (0, vitest_1.it)('contains OpenAPI operation for creating entries', function () {
        (0, vitest_1.expect)(typeof apiClient_1.createEntry).toBe('function');
    });
});
