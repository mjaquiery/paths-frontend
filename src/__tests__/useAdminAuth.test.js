"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var useAdminAuth_1 = require("../composables/useAdminAuth");
var ADMIN_TOKEN_KEY = 'admin_token';
(0, vitest_1.describe)('useAdminAuth', function () {
    (0, vitest_1.beforeEach)(function () {
        localStorage.clear();
    });
    (0, vitest_1.afterEach)(function () {
        localStorage.clear();
    });
    (0, vitest_1.it)('initialises with no token when localStorage is empty', function () {
        var _a = (0, useAdminAuth_1.useAdminAuth)(), adminToken = _a.adminToken, isAdminLoggedIn = _a.isAdminLoggedIn;
        (0, vitest_1.expect)(adminToken.value).toBeNull();
        (0, vitest_1.expect)(isAdminLoggedIn.value).toBe(false);
    });
    (0, vitest_1.it)('reads an existing token from localStorage on init', function () {
        localStorage.setItem(ADMIN_TOKEN_KEY, 'existing-token');
        var _a = (0, useAdminAuth_1.useAdminAuth)(), adminToken = _a.adminToken, isAdminLoggedIn = _a.isAdminLoggedIn;
        (0, vitest_1.expect)(adminToken.value).toBe('existing-token');
        (0, vitest_1.expect)(isAdminLoggedIn.value).toBe(true);
    });
    (0, vitest_1.it)('storeToken sets the reactive ref and persists to localStorage', function () {
        var _a = (0, useAdminAuth_1.useAdminAuth)(), adminToken = _a.adminToken, isAdminLoggedIn = _a.isAdminLoggedIn, storeToken = _a.storeToken;
        storeToken('my-admin-token');
        (0, vitest_1.expect)(adminToken.value).toBe('my-admin-token');
        (0, vitest_1.expect)(isAdminLoggedIn.value).toBe(true);
        (0, vitest_1.expect)(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe('my-admin-token');
    });
    (0, vitest_1.it)('clearToken nulls the reactive ref and removes from localStorage', function () {
        localStorage.setItem(ADMIN_TOKEN_KEY, 'some-token');
        var _a = (0, useAdminAuth_1.useAdminAuth)(), adminToken = _a.adminToken, isAdminLoggedIn = _a.isAdminLoggedIn, clearToken = _a.clearToken;
        clearToken();
        (0, vitest_1.expect)(adminToken.value).toBeNull();
        (0, vitest_1.expect)(isAdminLoggedIn.value).toBe(false);
        (0, vitest_1.expect)(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    });
    (0, vitest_1.it)('getAdminAuthHeaders returns correct Authorization header when logged in', function () {
        var _a = (0, useAdminAuth_1.useAdminAuth)(), storeToken = _a.storeToken, getAdminAuthHeaders = _a.getAdminAuthHeaders;
        storeToken('secret-token');
        var headers = getAdminAuthHeaders();
        (0, vitest_1.expect)(headers).toEqual({ Authorization: 'Bearer secret-token' });
    });
    (0, vitest_1.it)('getAdminAuthHeaders throws when not logged in', function () {
        var getAdminAuthHeaders = (0, useAdminAuth_1.useAdminAuth)().getAdminAuthHeaders;
        (0, vitest_1.expect)(function () { return getAdminAuthHeaders(); }).toThrow('Admin not authenticated');
    });
});
