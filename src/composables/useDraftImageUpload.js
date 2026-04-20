"use strict";
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
exports.useDraftImageUpload = useDraftImageUpload;
var vue_1 = require("vue");
var apiClient_1 = require("../generated/apiClient");
var errors_1 = require("../lib/errors");
/**
 * Composable for uploading a single image to an open draft.
 *
 * Flow:
 *   1. POST /v1/entry-drafts/:draftId/images  → get upload_url + draft_image_id
 *   2. PUT upload_url (direct to storage)
 *   3. POST /v1/entry-drafts/:draftId/images/:draftImageId/complete
 *
 * The image moves through states: awaiting_upload → uploading → ready (via background task).
 * The caller should poll GET /v1/entry-drafts/:draftId to observe the final ready state.
 */
function useDraftImageUpload() {
    var uploading = (0, vue_1.ref)(false);
    var uploadError = (0, vue_1.ref)('');
    var createSlot = (0, apiClient_1.useCreateDraftImageSlot)().mutateAsync;
    var completeUpload = (0, apiClient_1.useCompleteDraftImageUpload)().mutateAsync;
    /**
     * Upload a file to a draft. Returns the DraftImageResponse (in "uploading" state)
     * after completing the three-step flow. The caller polls the draft to check when
     * the image reaches "ready".
     *
     * Returns null on failure; uploadError will be set.
     */
    function uploadDraftImage(draftId, file, clientImageId) {
        return __awaiter(this, void 0, void 0, function () {
            var slotResponse, slot, draftImageId, uploadUrl, putResponse, completeResponse, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        uploading.value = true;
                        uploadError.value = '';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, createSlot({
                                draftId: draftId,
                                data: {
                                    filename: file.name,
                                    content_type: file.type || 'image/jpeg',
                                    strip_metadata: true,
                                    client_image_id: clientImageId !== null && clientImageId !== void 0 ? clientImageId : null,
                                },
                            })];
                    case 2:
                        slotResponse = _b.sent();
                        if (slotResponse.status !== 201) {
                            throw new Error('Failed to create draft image slot.');
                        }
                        slot = slotResponse.data;
                        draftImageId = slot.id;
                        uploadUrl = slot.upload_url;
                        return [4 /*yield*/, fetch(uploadUrl, {
                                method: 'PUT',
                                body: file,
                                headers: file.type ? { 'Content-Type': file.type } : {},
                            })];
                    case 3:
                        putResponse = _b.sent();
                        if (!putResponse.ok) {
                            throw new Error("Upload failed: HTTP ".concat(putResponse.status));
                        }
                        return [4 /*yield*/, completeUpload({
                                draftId: draftId,
                                draftImageId: String(draftImageId),
                                data: { byte_size: file.size },
                            })];
                    case 4:
                        completeResponse = _b.sent();
                        if (completeResponse.status !== 200) {
                            throw new Error('Failed to finalize draft image upload.');
                        }
                        return [2 /*return*/, completeResponse.data];
                    case 5:
                        err_1 = _b.sent();
                        uploadError.value =
                            (_a = (0, errors_1.extractErrorMessage)(err_1)) !== null && _a !== void 0 ? _a : 'Image upload failed. Please try again.';
                        return [2 /*return*/, null];
                    case 6:
                        uploading.value = false;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    return { uploading: uploading, uploadError: uploadError, uploadDraftImage: uploadDraftImage };
}
