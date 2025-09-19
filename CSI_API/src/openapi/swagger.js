"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationSchema = exports.SuccessSchema = exports.ErrorSchema = exports.createOpenAPISchema = exports.createOpenAPIApp = void 0;
var zod_openapi_1 = require("@hono/zod-openapi");
var swagger_ui_1 = require("@hono/swagger-ui");
// Create OpenAPI app instance
var createOpenAPIApp = function () {
    var app = new zod_openapi_1.OpenAPIHono();
    // Add OpenAPI documentation route
    app.doc('/api/doc', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'CSI Frontend API',
            description: 'API for Command and Control System Interface',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],
    });
    // Add Swagger UI
    app.get('/api/swagger', (0, swagger_ui_1.swaggerUI)({ url: '/api/doc' }));
    return app;
};
exports.createOpenAPIApp = createOpenAPIApp;
// Helper to create OpenAPI schemas from Zod schemas
var createOpenAPISchema = function (schema, description) {
    return schema.openapi({ description: description });
};
exports.createOpenAPISchema = createOpenAPISchema;
// Common response schemas
exports.ErrorSchema = zod_openapi_1.z.object({
    error: zod_openapi_1.z.string(),
    message: zod_openapi_1.z.string().optional(),
    details: zod_openapi_1.z.any().optional(),
}).openapi('Error');
exports.SuccessSchema = zod_openapi_1.z.object({
    success: zod_openapi_1.z.boolean(),
    message: zod_openapi_1.z.string().optional(),
    data: zod_openapi_1.z.any().optional(),
}).openapi('Success');
exports.PaginationSchema = zod_openapi_1.z.object({
    page: zod_openapi_1.z.number().int().positive().default(1),
    limit: zod_openapi_1.z.number().int().positive().max(100).default(20),
    total: zod_openapi_1.z.number().int().optional(),
    totalPages: zod_openapi_1.z.number().int().optional(),
}).openapi('Pagination');
