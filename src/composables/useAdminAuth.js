"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAdminAuth = useAdminAuth;
var vue_1 = require("vue");
var ADMIN_TOKEN_KEY = 'admin_token';
function readStoredAdminToken() {
    try {
        if (typeof localStorage === 'undefined' ||
            typeof localStorage.getItem !== 'function') {
            return null;
        }
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    catch (_a) {
        return null;
    }
}
function writeAdminToken(token) {
    try {
        if (typeof localStorage === 'undefined' ||
            typeof localStorage.setItem !== 'function') {
            return;
        }
        if (token === null) {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
        }
        else {
            localStorage.setItem(ADMIN_TOKEN_KEY, token);
        }
    }
    catch (_a) {
        // ignore storage errors
    }
}
function useAdminAuth() {
    var adminToken = (0, vue_1.ref)(readStoredAdminToken());
    var isAdminLoggedIn = (0, vue_1.computed)(function () { return adminToken.value !== null; });
    function storeToken(token) {
        adminToken.value = token;
        writeAdminToken(token);
    }
    function clearToken() {
        adminToken.value = null;
        writeAdminToken(null);
    }
    /**
     * Returns HTTP headers to authenticate an admin API call.
     * Throws if not logged in.
     */
    function getAdminAuthHeaders() {
        if (!adminToken.value) {
            throw new Error('Admin not authenticated');
        }
        return { Authorization: "Bearer ".concat(adminToken.value) };
    }
    return {
        adminToken: adminToken,
        isAdminLoggedIn: isAdminLoggedIn,
        storeToken: storeToken,
        clearToken: clearToken,
        getAdminAuthHeaders: getAdminAuthHeaders,
    };
}
