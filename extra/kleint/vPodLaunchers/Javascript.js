/*! Javascript - Klient v0.1-alpha */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/types.ts
var DEBUG_LEVELS = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};


;// CONCATENATED MODULE: ./src/utils.ts
var __assign = (undefined && undefined.__assign) || function () {
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
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

var CustomLogger = /** @class */ (function () {
    function CustomLogger(level) {
        if (level === void 0) { level = "debug"; }
        this.level = DEBUG_LEVELS[level];
    }
    CustomLogger.getInstance = function (level) {
        if (!CustomLogger.instance || CustomLogger.instance.level !== DEBUG_LEVELS[level]) {
            CustomLogger.instance = new CustomLogger(level);
        }
        return CustomLogger.instance;
    };
    CustomLogger.prototype.log = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (DEBUG_LEVELS[level] <= this.level) {
            console.log.apply(console, args);
        }
    };
    CustomLogger.instance = null;
    return CustomLogger;
}());
function isValidUrl(url) {
    var urlPattern = /(?:https?|vpod):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return urlPattern.test(url);
}
function extractDataFromUrl(url, requestId, sessionId) {
    if (!isValidUrl(url))
        throw new Error("[Kleint-Connector] URL is not valid: " + url);
    var jsUrl = new URL(url);
    var protocol = jsUrl.protocol.slice(0, -1);
    if (protocol === "vpod") {
        url = url.replace("vpod://", "http://");
        jsUrl = new URL(url);
    }
    ;
    var destination = jsUrl.hostname;
    var restParamsString = jsUrl.pathname.startsWith("/") ? jsUrl.pathname.slice(1) : jsUrl.pathname;
    var restParams = restParamsString.split("/");
    var path = restParams.splice(0, 1)[0];
    var params = Array.from(jsUrl.searchParams.keys()).map(function (key) { return "".concat(key, "=").concat(jsUrl.searchParams.get(key)); });
    params = __spreadArray(__spreadArray([], params, true), restParams.map(function (p, i) { return "".concat(i, "=").concat(p); }), true);
    if (requestId)
        params.push("requestId=".concat(requestId));
    if (sessionId)
        params.push("sessionId=".concat(sessionId));
    return { protocol: protocol, destination: destination, path: path, params: params };
}
function createHttpMessage(message, sessionId) {
    var _a = extractDataFromUrl(message.Url), protocol = _a.protocol, destination = _a.destination, path = _a.path, params = _a.params;
    return __assign(__assign({}, message), { RequestId: message.RequestId, SessionId: sessionId, Protocol: protocol, Destination: destination, Path: path, Params: params });
}
function generateRandomString(length) {
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var randomString = "";
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }
    return randomString;
}
function getHeader(headers, headerName) {
    for (var key in headers) {
        if (key.toLowerCase() === headerName.toLowerCase()) {
            return headers[key];
        }
    }
    return undefined;
}


;// CONCATENATED MODULE: ./src/vPodLaunchers/common.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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

self.vpod = { name: "", env: {}, reachableVPods: [], space: "", location: {} };
var requests = {};
var extractHeaders = function (options) {
    var headersObj = {};
    var headersInit = (options === null || options === void 0 ? void 0 : options.headers) || (options === null || options === void 0 ? void 0 : options.get("headers"));
    if (!headersInit)
        return headersObj;
    if (Array.isArray(headersInit) || headersInit instanceof Headers) {
        headersInit.forEach(function (key, value) {
            if (typeof key === 'string')
                headersObj[value] = String(key);
            else if (Array.isArray(key))
                headersObj[key[1]] = key[0];
        });
    }
    else if (headersInit instanceof Map) {
        headersObj = Object.fromEntries(headersInit);
    }
    else {
        for (var _i = 0, _a = Object.entries(headersInit); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            headersObj[key] = String(value);
        }
    }
    return headersObj;
};
var extractBody = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(options === null || options === void 0 ? void 0 : options.body) && !(options instanceof Map))
                    return [2 /*return*/, undefined];
                return [4 /*yield*/, customExtractBody((options === null || options === void 0 ? void 0 : options.body) || (options === null || options === void 0 ? void 0 : options.get("body")))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var handleRequest = function (requestId, url, requestInfo, options) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, data, _a, protocol, destination, path, params, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                headers = extractHeaders(requestInfo !== undefined ? requestInfo : options);
                headers["X-Kleint-Sender"] = self.vpod.name;
                headers["X-Kleint-Session-Sender"] = self.sessionId;
                headers["X-Kleint-Session-Destination"] = (_b = getHeader(headers, "X-Kleint-Session-Destination")) !== null && _b !== void 0 ? _b : self.sessionId;
                return [4 /*yield*/, extractBody(requestInfo !== undefined ? requestInfo : options)];
            case 1:
                data = _c.sent();
                _a = extractDataFromUrl(url, requestId, self.sessionId), protocol = _a.protocol, destination = _a.destination, path = _a.path, params = _a.params;
                message = {
                    Type: "httpRequest",
                    Message: {
                        SessionId: self.sessionId,
                        RequestId: requestId,
                        Sender: self.vpod.name,
                        Protocol: protocol,
                        Destination: destination,
                        Method: requestInfo !== undefined ? requestInfo.method : options === null || options === void 0 ? void 0 : options.method,
                        Headers: headers,
                        Url: url,
                        Path: path,
                        Params: params,
                        Body: data,
                    }
                };
                return [2 /*return*/, message];
        }
    });
}); };
function interceptFetch(input, options) {
    return __awaiter(this, void 0, void 0, function () {
        var url_1, requestInfo, isAllowedDomain, path, newInput, newInput;
        return __generator(this, function (_a) {
            if (input) {
                url_1 = input instanceof URL || typeof input === "string" ? input.toString() : input.url;
                requestInfo = input instanceof Request ? input : undefined;
                isAllowedDomain = self.vpod.reachableVPods.some(function (domain) { return url_1.includes("".concat(domain)); });
                if (url_1.startsWith("vpod://") || isAllowedDomain) {
                    return [2 /*return*/, handleVPodFetch(url_1, requestInfo, options)];
                }
                if (url_1.startsWith("http")) {
                    path = new URL(url_1).pathname;
                    if (path.startsWith(self.originalBasePath)) {
                        newInput = path.replace(self.originalBasePath, self.resourcesUrl);
                        return [2 /*return*/, originalFetch(newInput, options)];
                    }
                }
                else {
                    newInput = void 0;
                    if (url_1.startsWith("/"))
                        newInput = url_1.replace(self.originalBasePath, self.resourcesUrl);
                    else
                        newInput = self.resourcesUrl + "/" + url_1;
                    return [2 /*return*/, originalFetch(newInput, options)];
                }
            }
            return [2 /*return*/, originalFetch(input, options)];
        });
    });
}
function handleVPodFetch(url, requestInfo, options) {
    return __awaiter(this, void 0, void 0, function () {
        var requestId, message, statusCode, responseBody, response_1, _a, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    requestId = generateRandomString(10);
                    return [4 /*yield*/, handleRequest(requestId, url, requestInfo, options)];
                case 1:
                    message = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    self.postMessage(message);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            requests[requestId] = { resolve: resolve, reject: reject };
                        })];
                case 3:
                    response_1 = _b.sent();
                    statusCode = response_1.StatusCode;
                    responseBody = customResponseBody(response_1.Body);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    statusCode = 500;
                    responseBody = "Internal Server Error";
                    return [3 /*break*/, 5];
                case 5:
                    response = new Response(responseBody, { status: statusCode, headers: { "Content-Type": "application/json" } });
                    Object.defineProperty(response, 'url', { value: url });
                    return [2 /*return*/, response];
            }
        });
    });
}
var handleMessage = function (e) { return __awaiter(void 0, void 0, void 0, function () {
    var data, message, _a, requestId, res;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                data = e.data;
                _a = data.Type;
                switch (_a) {
                    case "runVPods": return [3 /*break*/, 1];
                    case "httpResponse": return [3 /*break*/, 2];
                    case "httpRequest": return [3 /*break*/, 3];
                }
                return [3 /*break*/, 5];
            case 1:
                message = data.Message.Body;
                self.vpod = {
                    name: message.Name,
                    env: message.Environment,
                    reachableVPods: message.ReachableVPods,
                    space: message.Space,
                    location: location
                };
                self.originalBasePath = new URL(self.location.href).pathname.split("/").slice(0, -1).join("/");
                self.resourcesUrl = message.ResourcesUrl ?
                    message.ResourcesUrl.startsWith("http") ?
                        message.ResourcesUrl :
                        "".concat(data.Message.Url, "/").concat(message.ResourcesUrl) :
                    "".concat(data.Message.Url, "/resources/").concat(self.vpod.name);
                self.sessionId = data.Message.SessionId;
                runVPod(message.Image);
                return [3 /*break*/, 6];
            case 2:
                requestId = data.Message.RequestId;
                if (requestId in requests) {
                    requests[requestId].resolve(data.Message);
                    delete requests[requestId];
                }
                else {
                    console.error("[HTTP-Response] The request ".concat(requestId, " is not defined."), requests);
                }
                return [3 /*break*/, 6];
            case 3:
                message = data.Message;
                message.Params.push("sessionId=".concat(self.sessionId));
                return [4 /*yield*/, sendHttpRequest(message, self.vpod.name, self.sessionId)];
            case 4:
                res = _b.sent();
                self.postMessage(res);
                return [3 /*break*/, 6];
            case 5: return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
var originalFetch = fetch;
self.fetch = interceptFetch;
self.onmessage = handleMessage;

;// CONCATENATED MODULE: ./src/vPodLaunchers/launchers/Javascript.ts
var Javascript_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Javascript_generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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

self.customExtractBody = function (body) { return Javascript_awaiter(void 0, void 0, void 0, function () {
    return Javascript_generator(this, function (_a) {
        return [2 /*return*/, JSON.parse(body)];
    });
}); };
self.customResponseBody = function (body) {
    return JSON.stringify(body);
};
self.runVPod = function (url) { return Javascript_awaiter(void 0, void 0, void 0, function () {
    var vPod;
    return Javascript_generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, import(/* webpackIgnore: true */ url)];
            case 1:
                vPod = _a.sent();
                self.vPod = vPod;
                return [2 /*return*/];
        }
    });
}); };
self.sendHttpRequest = function (message, virtualPodName, sessionId) { return Javascript_awaiter(void 0, void 0, void 0, function () {
    var functionName, response, vPod, params, returnValue;
    return Javascript_generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                functionName = message.Path, vPod = self.vPod;
                if (!(functionName in vPod && typeof vPod[functionName] === "function")) return [3 /*break*/, 2];
                params = {};
                message.Params.forEach(function (param) {
                    var value = param.split("=");
                    params[value[0]] = value[1];
                });
                return [4 /*yield*/, vPod[functionName](message.Body, params, message.Headers)];
            case 1:
                returnValue = _a.sent();
                response = {
                    Type: "httpResponse",
                    Message: {
                        RequestId: message.RequestId,
                        SessionId: sessionId,
                        Sender: virtualPodName,
                        Destination: message.Sender,
                        StatusCode: 200,
                        Body: typeof returnValue === "object" && returnValue
                            ? returnValue
                            : { message: returnValue !== null && returnValue !== void 0 ? returnValue : "ok" },
                    }
                };
                return [3 /*break*/, 3];
            case 2:
                console.error("[HTTP-Request] The function ".concat(functionName, " is not defined."));
                response = {
                    Type: "httpResponse",
                    Message: {
                        RequestId: message.RequestId,
                        SessionId: sessionId,
                        Sender: virtualPodName,
                        Destination: message.Sender,
                        StatusCode: 500,
                        Body: { message: "error" },
                    }
                };
                _a.label = 3;
            case 3: return [2 /*return*/, response];
        }
    });
}); };

/******/ })()
;