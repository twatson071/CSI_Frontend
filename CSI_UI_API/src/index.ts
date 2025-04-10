import { Hono } from 'hono/quick'

const app = new Hono()

const serviceName = 'csi_tripplite_pdumh20';
const externalApiBaseUrl = 'http://127.0.0.1:8090/service/csi_tripplite_pdumh20';

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
