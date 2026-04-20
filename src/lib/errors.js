"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractErrorMessage = extractErrorMessage;
/** Extract a human-readable message from an unknown caught error. */
function extractErrorMessage(err) {
    var _a;
    if (typeof err === 'string')
        return err;
    if (!err || typeof err !== 'object')
        return undefined;
    var e = err;
    var responseData = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data;
    if (responseData && typeof responseData === 'object') {
        var data = responseData;
        if (typeof data.message === 'string')
            return data.message;
        if (typeof data.error === 'string')
            return data.error;
    }
    if (typeof e.message === 'string')
        return e.message;
    return undefined;
}
