"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vue_query_1 = require("@tanstack/vue-query");
var query_persist_client_core_1 = require("@tanstack/query-persist-client-core");
var queryPersister_1 = require("~/src/lib/queryPersister");
exports.default = defineNuxtPlugin(function (nuxtApp) {
    var queryClient = new vue_query_1.QueryClient({
        defaultOptions: {
            queries: {
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
                staleTime: 1000 * 60 * 5, // 5 minutes
            },
        },
    });
    (0, query_persist_client_core_1.persistQueryClient)({
        queryClient: queryClient,
        persister: queryPersister_1.dexiePersister,
    });
    var options = { queryClient: queryClient };
    nuxtApp.vueApp.use(vue_query_1.VueQueryPlugin, options);
});
