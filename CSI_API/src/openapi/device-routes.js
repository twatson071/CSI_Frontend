"use strict";
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
exports.deviceOpenAPIRoutes = void 0;
var zod_openapi_1 = require("@hono/zod-openapi");
var deviceValidationSchemas_1 = require("../routes/devices/deviceValidationSchemas");
var swagger_1 = require("./swagger");
// Create OpenAPI schemas from existing validation schemas
var DeviceCreateSchema = (0, swagger_1.createOpenAPISchema)(deviceValidationSchemas_1.deviceCreateSchema, 'Device creation data');
var DeviceUpdateSchema = (0, swagger_1.createOpenAPISchema)(deviceValidationSchemas_1.deviceUpdateSchema, 'Device update data');
var DeviceSchema = zod_openapi_1.z.object({
    id: zod_openapi_1.z.number(),
    name: zod_openapi_1.z.string(),
    type: zod_openapi_1.z.string(),
    ipAddress: zod_openapi_1.z.string(),
    macAddress: zod_openapi_1.z.string().optional(),
    status: zod_openapi_1.z.enum(['online', 'offline', 'warning', 'error']),
    site: zod_openapi_1.z.number(),
    apiEndpoint: zod_openapi_1.z.string().optional(),
    createdAt: zod_openapi_1.z.string(),
    updatedAt: zod_openapi_1.z.string(),
}).openapi('Device');
exports.deviceOpenAPIRoutes = new zod_openapi_1.OpenAPIHono();
// GET /api/devices
var getDevicesRoute = (0, zod_openapi_1.createRoute)({
    method: 'get',
    path: '/api/devices',
    tags: ['Devices'],
    summary: 'List all devices',
    description: 'Retrieve a list of all devices with optional filtering',
    request: {
        query: zod_openapi_1.z.object({
            site: zod_openapi_1.z.string().optional().openapi({
                description: 'Filter by site ID',
                example: '1',
            }),
            type: zod_openapi_1.z.string().optional().openapi({
                description: 'Filter by device type',
                example: 'Server',
            }),
            status: zod_openapi_1.z.enum(['online', 'offline', 'warning', 'error']).optional().openapi({
                description: 'Filter by status',
            }),
        }),
    },
    responses: {
        200: {
            description: 'List of devices',
            content: {
                'application/json': {
                    schema: zod_openapi_1.z.array(DeviceSchema),
                },
            },
        },
        400: {
            description: 'Bad request',
            content: {
                'application/json': {
                    schema: swagger_1.ErrorSchema,
                },
            },
        },
    },
});
// POST /api/devices
var createDeviceRoute = (0, zod_openapi_1.createRoute)({
    method: 'post',
    path: '/api/devices',
    tags: ['Devices'],
    summary: 'Create a new device',
    description: 'Create a new device in the system',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: DeviceCreateSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Device created successfully',
            content: {
                'application/json': {
                    schema: DeviceSchema,
                },
            },
        },
        400: {
            description: 'Invalid input',
            content: {
                'application/json': {
                    schema: swagger_1.ErrorSchema,
                },
            },
        },
    },
});
// GET /api/devices/:id
var getDeviceRoute = (0, zod_openapi_1.createRoute)({
    method: 'get',
    path: '/api/devices/{id}',
    tags: ['Devices'],
    summary: 'Get device by ID',
    description: 'Retrieve a specific device by its ID',
    request: {
        params: zod_openapi_1.z.object({
            id: zod_openapi_1.z.string().openapi({
                description: 'Device ID',
                example: '1',
            }),
        }),
    },
    responses: {
        200: {
            description: 'Device details',
            content: {
                'application/json': {
                    schema: DeviceSchema,
                },
            },
        },
        404: {
            description: 'Device not found',
            content: {
                'application/json': {
                    schema: swagger_1.ErrorSchema,
                },
            },
        },
    },
});
// PUT /api/devices/:id
var updateDeviceRoute = (0, zod_openapi_1.createRoute)({
    method: 'put',
    path: '/api/devices/{id}',
    tags: ['Devices'],
    summary: 'Update device',
    description: 'Update an existing device',
    request: {
        params: zod_openapi_1.z.object({
            id: zod_openapi_1.z.string().openapi({
                description: 'Device ID',
                example: '1',
            }),
        }),
        body: {
            content: {
                'application/json': {
                    schema: DeviceUpdateSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Device updated successfully',
            content: {
                'application/json': {
                    schema: DeviceSchema,
                },
            },
        },
        400: {
            description: 'Invalid input',
            content: {
                'application/json': {
                    schema: swagger_1.ErrorSchema,
                },
            },
        },
        404: {
            description: 'Device not found',
            content: {
                'application/json': {
                    schema: swagger_1.ErrorSchema,
                },
            },
        },
    },
});
// DELETE /api/devices/:id
var deleteDeviceRoute = (0, zod_openapi_1.createRoute)({
    method: 'delete',
    path: '/api/devices/{id}',
    tags: ['Devices'],
    summary: 'Delete device',
    description: 'Delete a device from the system',
    request: {
        params: zod_openapi_1.z.object({
            id: zod_openapi_1.z.string().openapi({
                description: 'Device ID',
                example: '1',
            }),
        }),
    },
    responses: {
        200: {
            description: 'Device deleted successfully',
            content: {
                'application/json': {
                    schema: swagger_1.SuccessSchema,
                },
            },
        },
        404: {
            description: 'Device not found',
            content: {
                'application/json': {
                    schema: swagger_1.ErrorSchema,
                },
            },
        },
    },
});
// Register routes (you'll need to implement handlers)
exports.deviceOpenAPIRoutes.openapi(getDevicesRoute, function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implementation would go here
        return [2 /*return*/, c.json([])];
    });
}); });
exports.deviceOpenAPIRoutes.openapi(createDeviceRoute, function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implementation would go here
        return [2 /*return*/, c.json(__assign({ id: 1 }, c.req.valid('json')), 201)];
    });
}); });
exports.deviceOpenAPIRoutes.openapi(getDeviceRoute, function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implementation would go here
        return [2 /*return*/, c.json({ id: parseInt(c.req.param('id')) })];
    });
}); });
exports.deviceOpenAPIRoutes.openapi(updateDeviceRoute, function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implementation would go here
        return [2 /*return*/, c.json(__assign({ id: parseInt(c.req.param('id')) }, c.req.valid('json')))];
    });
}); });
exports.deviceOpenAPIRoutes.openapi(deleteDeviceRoute, function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Implementation would go here
        return [2 /*return*/, c.json({ success: true, message: 'Device deleted' })];
    });
}); });
