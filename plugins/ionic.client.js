"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("@ionic/vue");
exports.default = defineNuxtPlugin(function (nuxtApp) {
    nuxtApp.vueApp.use(vue_1.IonicVue);
});
