# CSI_API

A small Hono-based HTTP API that proxies PDU (Power Distribution Unit) devices defined in a SQLite database, forwarding requests to an external service.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [Available Routes](#available-routes)
7. [Project Structure](#project-structure)
8. [Testing](#testing)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Node-compatible terminal (tested on Linux)

## Installation

1. Clone the repo and `cd` into this folder:

   ```bash
   bun install
   ```

   ```markdown

   ```

# CSI_API

A small Hono-based HTTP API that proxies PDU (Power Distribution Unit) devices defined in a SQLite database, forwarding requests to an external service.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [Available Routes](#available-routes)
7. [Project Structure](#project-structure)
8. [Testing](#testing)
9. [License](#license)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- A Node‐compatible terminal (tested on Linux)
- An external API with valid PDU endpoints and API keys

## Installation

1. Clone this repository and `cd` into the project folder:

   ```bash
   git clone https://github.com/your-org/CSI_Frontend.git
   cd CSI_Frontend/CSI_API
   ```

2. Install dependencies with Bun:

   ```bash
   bun install
   ```

3. Copy the example env file and fill in your own values:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

Create a `.env` in the project root (or update it from `.env.example`) with:

```bash
# SQLite file (no "file:" prefix)
DB_FILE_NAME=local.db

# External API endpoint
EXTERNAL_BASE_URL=https://api.example.com

# API‐Key headers for external service
SYSTEM_OPERATOR_KEY=your-system-operator-key
HUB_KEY=your-hub-key
```

> Note: Do **not** commit your real `.env` file to version control.

## Database Setup

- The app uses **Drizzle ORM** with a SQLite file (default `local.db`).
- On first run, Bun/SQLite will create the database file if it doesn’t exist.
- Define or migrate your schema in `src/db/schema.ts`, for example:

  ```typescript
  // src/db/schema.ts
  import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

  export const devices = sqliteTable("devices", {
    id: integer("id").primaryKey().notNull(),
    name: text("name").notNull(),
    serviceUrl: text("serviceUrl").notNull(),
    type: text("type").notNull(), // e.g. "PDU"
  });
  ```

## Running the Server

Start the development server:

```bash
bun run dev
```

The Hono app listens on **port 3000** by default.  
Visit `http://localhost:3000` or your configured host/port.

## Available Routes

All PDU proxy routes are mounted under `/pdu/tripplite`:

- **GET** `/pdu/tripplite`  
  Fetch status/data for all `PDU` devices in the database.  
  Response:

  ```json
  [
    {
      "deviceId": 1,
      "name": "Tripplite-PDU-0",
      "status": 200,
      "data": {
        /* …external API data… */
      }
    }
    // …
  ]
  ```

- **POST** `/pdu/tripplite`  
  Proxy a JSON body to all `PDU` devices (e.g. toggle an outlet).  
  Request body example:
  ```json
  { "outlet": 3, "state": "on" }
  ```
  Response:
  ```json
  [
    {
      "deviceId": 1,
      "name": "Tripplite-PDU-0",
      "status": 200,
      "data": {
        /* …result of POST… */
      }
    }
    // …
  ]
  ```

## Project Structure

```
CSI_API/
├─ src/
│  ├─ db.ts               # Bun/SQLite + Drizzle initialization
│  ├─ db/
│  │  └─ schema.ts        # Drizzle table definitions
│  ├─ routes/
│  │  └─ PDUroutes/
│  │     └─ pduRoutes.ts  # /pdu/ GET & POST handlers
│  └─ index.ts            # App entrypoint and route mounting
├─ .env.example           # Example environment variables
├─ .env                   # Your local env (gitignored)
├─ local.db               # SQLite database file (auto-created)
├─ package.json
├─ bun.lock
└─ README.md
```

## Testing

_Integration and unit tests coming soon._

You can use Bun’s built-in test runner or integrate [Vitest](https://vitest.dev/) / [Jest](https://jestjs.io/) to cover:

- Route handlers
- Database queries
- Error and edge cases
