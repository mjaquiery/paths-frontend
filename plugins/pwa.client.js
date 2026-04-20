"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var virtual_pwa_register_1 = require("virtual:pwa-register");
exports.default = defineNuxtPlugin(function () {
    // Boot the service worker immediately; it will auto-update in the background.
    (0, virtual_pwa_register_1.registerSW)({ immediate: true });
});
