"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEntries = useEntries;
exports.useEntryContent = useEntryContent;
var vue_1 = require("vue");
var apiClient_1 = require("../generated/apiClient");
function useEntries(pathId) {
    return (0, apiClient_1.useListEntries)(pathId, {
        query: {
            select: function (r) { return r.data; },
        },
    });
}
function useEntryContent(pathId, entryId, editId) {
    return (0, apiClient_1.useGetEntry)(pathId, entryId, {
        query: {
            queryKey: ['v1', 'paths', pathId, 'entries', entryId, editId],
            enabled: (0, vue_1.computed)(function () { return !!pathId.value && !!entryId.value && !!editId.value; }),
            select: function (r) { return r.data; },
        },
    });
}
