import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { deviceCreateSchema, deviceUpdateSchema } from '../routes/devices/deviceValidationSchemas';
import { ErrorSchema, SuccessSchema, createOpenAPISchema } from './swagger';

// Create OpenAPI schemas from existing validation schemas
const DeviceCreateSchema = createOpenAPISchema(deviceCreateSchema, 'Device creation data');
const DeviceUpdateSchema = createOpenAPISchema(deviceUpdateSchema, 'Device update data');

const DeviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  ipAddress: z.string(),
  macAddress: z.string().optional(),
  status: z.enum(['online', 'offline', 'warning', 'error']),
  site: z.number(),
  apiEndpoint: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi('Device');

export const deviceOpenAPIRoutes = new OpenAPIHono();

// GET /api/devices
const getDevicesRoute = createRoute({
  method: 'get',
  path: '/api/devices',
  tags: ['Devices'],
  summary: 'List all devices',
  description: 'Retrieve a list of all devices with optional filtering',
  request: {
    query: z.object({
      site: z.string().optional().openapi({
        description: 'Filter by site ID',
        example: '1',
      }),
      type: z.string().optional().openapi({
        description: 'Filter by device type',
        example: 'Server',
      }),
      status: z.enum(['online', 'offline', 'warning', 'error']).optional().openapi({
        description: 'Filter by status',
      }),
    }),
  },
  responses: {
    200: {
      description: 'List of devices',
      content: {
        'application/json': {
          schema: z.array(DeviceSchema),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// POST /api/devices
const createDeviceRoute = createRoute({
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
          schema: ErrorSchema,
        },
      },
    },
  },
});

// GET /api/devices/:id
const getDeviceRoute = createRoute({
  method: 'get',
  path: '/api/devices/{id}',
  tags: ['Devices'],
  summary: 'Get device by ID',
  description: 'Retrieve a specific device by its ID',
  request: {
    params: z.object({
      id: z.string().openapi({
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
          schema: ErrorSchema,
        },
      },
    },
  },
});

// PUT /api/devices/:id
const updateDeviceRoute = createRoute({
  method: 'put',
  path: '/api/devices/{id}',
  tags: ['Devices'],
  summary: 'Update device',
  description: 'Update an existing device',
  request: {
    params: z.object({
      id: z.string().openapi({
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
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// DELETE /api/devices/:id
const deleteDeviceRoute = createRoute({
  method: 'delete',
  path: '/api/devices/{id}',
  tags: ['Devices'],
  summary: 'Delete device',
  description: 'Delete a device from the system',
  request: {
    params: z.object({
      id: z.string().openapi({
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
          schema: SuccessSchema,
        },
      },
    },
    404: {
      description: 'Device not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Register routes (you'll need to implement handlers)
deviceOpenAPIRoutes.openapi(getDevicesRoute, async (c) => {
  // Implementation would go here
  return c.json([]);
});

deviceOpenAPIRoutes.openapi(createDeviceRoute, async (c) => {
  // Implementation would go here
  return c.json({ id: 1, ...c.req.valid('json') }, 201);
});

deviceOpenAPIRoutes.openapi(getDeviceRoute, async (c) => {
  // Implementation would go here
  return c.json({ id: parseInt(c.req.param('id')) });
});

deviceOpenAPIRoutes.openapi(updateDeviceRoute, async (c) => {
  // Implementation would go here
  return c.json({ id: parseInt(c.req.param('id')), ...c.req.valid('json') });
});

deviceOpenAPIRoutes.openapi(deleteDeviceRoute, async (c) => {
  // Implementation would go here
  return c.json({ success: true, message: 'Device deleted' });
});