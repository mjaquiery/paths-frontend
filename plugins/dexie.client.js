"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("~/src/lib/db");
exports.default = defineNuxtPlugin(function (nuxtApp) {
    nuxtApp.provide('db', db_1.db);
});
