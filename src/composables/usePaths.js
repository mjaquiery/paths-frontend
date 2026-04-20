"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePaths = usePaths;
var apiClient_1 = require("../generated/apiClient");
function usePaths() {
    return (0, apiClient_1.useListPaths)({
        query: {
            select: function (r) { return r.data; },
        },
    });
}
