export const tripplitePDUSpec = {
  openapi: "3.0.0",
  info: {
    title: "CSI Tripplite PDUMH20 API",
    version: "1.0.0",
    description: "API for managing the Tripplite PDUMH20 device.",
  },
  paths: {
    "/csi_tripplite_pdumh20": {
      get: {
        summary: "Get device information",
        description:
          "Fetch general information about the Tripplite PDUMH20 device.",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    make: { type: "string" },
                    model: { type: "string" },
                    statuses: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Toggle outlet power",
        description:
          "Toggle the power state of a specific outlet. The backend will wrap and forward the payload as required by the PDK.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  parameters: {
                    type: "object",
                    properties: {
                      outlets: {
                        type: "object",
                        additionalProperties: {
                          type: "object",
                          properties: {
                            state: {
                              type: "string",
                              enum: ["POWER_ON", "POWER_OFF"],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                required: ["parameters"],
              },
              example: {
                parameters: {
                  outlets: {
                    "1": { state: "POWER_ON" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          "400": {
            description: "Invalid payload",
          },
        },
      },
    },
  },
};
