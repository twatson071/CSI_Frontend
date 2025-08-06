import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

// Create OpenAPI app instance
export const createOpenAPIApp = () => {
  const app = new OpenAPIHono();

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
  app.get('/api/swagger', swaggerUI({ url: '/api/doc' }));

  return app;
};

// Helper to create OpenAPI schemas from Zod schemas
export const createOpenAPISchema = <T extends z.ZodTypeAny>(
  schema: T,
  description?: string
) => {
  return schema.openapi({ description });
};

// Common response schemas
export const ErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional(),
}).openapi('Error');

export const SuccessSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
}).openapi('Success');

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().optional(),
  totalPages: z.number().int().optional(),
}).openapi('Pagination');