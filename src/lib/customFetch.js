"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFetch = exports.ApiResponseError = void 0;
/**
 * Error thrown by `customFetch` when the server responds with a non-2xx
 * status code.  The `status` property carries the HTTP status so that
 * `classifyFailure` in `useApi` can correctly categorise the failure as an
 * auth error, conflict, validation error, or generic server error rather
 * than treating everything as a network failure.
 */
var ApiResponseError = /** @class */ (function (_super) {
    __extends(ApiResponseError, _super);
    function ApiResponseError(status, responseData) {
        var _this = _super.call(this, "Request failed: ".concat(status)) || this;
        _this.name = 'ApiResponseError';
        _this.status = status;
        _this.responseData = responseData;
        return _this;
    }
    return ApiResponseError;
}(Error));
exports.ApiResponseError = ApiResponseError;
var customFetch = function (url, options) { return __awaiter(void 0, void 0, void 0, function () {
    var baseUrl, storedToken, authHeader, response, responseData, _a, data, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
                storedToken = typeof localStorage !== 'undefined' &&
                    typeof localStorage.getItem === 'function'
                    ? localStorage.getItem('session_token')
                    : null;
                authHeader = storedToken
                    ? { Authorization: "Bearer ".concat(storedToken) }
                    : {};
                return [4 /*yield*/, fetch("".concat(baseUrl).concat(url), __assign(__assign({}, options), { credentials: 'include', headers: __assign(__assign({ 'Content-Type': 'application/json' }, authHeader), ((_c = options === null || options === void 0 ? void 0 : options.headers) !== null && _c !== void 0 ? _c : {})) }))];
            case 1:
                response = _d.sent();
                if (!!response.ok) return [3 /*break*/, 6];
                responseData = null;
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 5]);
                return [4 /*yield*/, response.json()];
            case 3:
                responseData = _d.sent();
                return [3 /*break*/, 5];
            case 4:
                _a = _d.sent();
                return [3 /*break*/, 5];
            case 5: throw new ApiResponseError(response.status, responseData);
            case 6:
                if (!(response.status === 204)) return [3 /*break*/, 7];
                _b = undefined;
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, response.json()];
            case 8:
                _b = _d.sent();
                _d.label = 9;
            case 9:
                data = _b;
                return [2 /*return*/, { data: data, status: response.status, headers: response.headers }];
        }
    });
}); };
exports.customFetch = customFetch;
