import { Hono } from 'hono/quick'
import { swaggerUI } from '@hono/swagger-ui'
import outletGroupRoutes from './routes/pdu/outletGroupRoutes'

const app = new Hono()

const serviceName = 'csi_tripplite_pdumh20';
const externalApiBaseUrl = 'http://127.0.0.1:8090/service/csi_tripplite_pdumh20_0';

// Middleware to enable CORS
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key-CSI-Maestro-SystemOperator, X-API-Key-CSI-Maestro-Hub'); // Allow specific headers
  await next();
});

// Middleware to add required headers
app.use('*', (c, next) => {
  c.req.header['X-API-Key-CSI-Maestro-SystemOperator'] = 'SystemOperator-1';
  c.req.header['X-API-Key-CSI-Maestro-Hub'] = 'Hub-1';
  return next();
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

// Use the middleware to serve Swagger UI at /ui
app.get('/ui', swaggerUI({ url: '/doc' }))

// Mount the PDU routes
app.route('/', outletGroupRoutes);

// Serve OpenAPI definition at /doc
app.get('/doc', (c) => {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'CSI Tripplite PDUMH20 API',
      version: '1.0.0',
      description: 'API for managing the Tripplite PDUMH20 device.',
    },
    paths: {
      [`/${serviceName}/parameters`]: {
        get: {
          summary: 'Get parameters',
          description: 'Fetch parameters for the Tripplite PDUMH20 device.',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
      [`/${serviceName}`]: {
        get: {
          summary: 'Get device information',
          description: 'Fetch general information about the Tripplite PDUMH20 device.',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
      [`/${serviceName}/parameters?outlet_index=2`]: {
        get: {
          summary: 'Get outlet 2 parameters',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
      [`/${serviceName}/parameters/outlet_groups/{index}/state`]: {
        get: {
          summary: 'Get outlet group state',
          description: 'Get the current state of an outlet group.',
          parameters: [
            {
              name: 'index',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      state: {
                        type: 'string',
                        enum: ['POWER_ON', 'POWER_OFF', 'POWER_MIXED', 'REBOOT']
                      },
                      success: {
                        type: 'boolean'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Set outlet group state',
          description: 'Set the state of an outlet group.',
          parameters: [
            {
              name: 'index',
              in: 'path',
              required: true,
              schema: {
                type: 'integer'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    state: {
                      type: 'string',
                      enum: ['POWER_ON', 'POWER_OFF', 'POWER_MIXED', 'REBOOT']
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      state: {
                        type: 'string',
                        enum: ['POWER_ON', 'POWER_OFF', 'POWER_MIXED', 'REBOOT']
                      },
                      success: {
                        type: 'boolean'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  };
  return c.json(openApiSpec);
});

// Parameters endpoint
app.get(`/${serviceName}/parameters`, async (c) => {
  const response = await fetch(`${externalApiBaseUrl}/parameters`, {
    headers: {
      'X-API-Key-CSI-Maestro-SystemOperator': 'SystemOperator-1',
      'X-API-Key-CSI-Maestro-Hub': 'Hub-1',
    },
  });
  const data = await response.json();
  return c.json(data);
});

app.get(`/${serviceName}`, async (c) => {
  const response = await fetch(`${externalApiBaseUrl}`, {
    headers: {
      'X-API-Key-CSI-Maestro-SystemOperator': 'SystemOperator-1',
      'X-API-Key-CSI-Maestro-Hub': 'Hub-1',
    },
  });
  const data = await response.json();
  return c.json(data);
});

// Sensors endpoint
app.get(`/${serviceName}/sensors`, async (c) => {
  const response = await fetch(`${externalApiBaseUrl}/${serviceName}/parameters`, {
    headers: {
      'X-API-Key-CSI-Maestro-SystemOperator': 'SystemOperator-1',
      'X-API-Key-CSI-Maestro-Hub': 'Hub-1',
    },
  });
  const data = await response.json();
  return c.json(data);
});

app.fire()
