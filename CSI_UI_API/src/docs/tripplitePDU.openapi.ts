export const tripplitePDUSpec = {
    openapi: '3.0.0',
    info: {
      title: 'CSI Tripplite PDUMH20 API',
      version: '1.0.0',
      description: 'API for managing the Tripplite PDUMH20 device.',
    },
    paths: {
      '/csi_tripplite_pdumh20/parameters': {
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
      '/csi_tripplite_pdumh20': {
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
      '/csi_tripplite_pdumh20/parameters?outlet_index=2': {
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
      '/csi_tripplite_pdumh20/parameters/outlet_groups/{index}/state': {
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
    }
  };