const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Lab Inventory Management API',
    version: '1.0.0',
    description: 'A comprehensive API for managing laboratory inventory, materials, requests, schedules, and AI-powered features',
    contact: {
      name: 'Lab Management Team',
      email: 'support@labinventory.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    },
    {
      url: 'https://api.labinventory.com/api',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login endpoint'
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'No token provided'
                }
              }
            }
          }
        }
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Access denied'
                }
              }
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found'
                }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Validation failed'
                }
              }
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Server error'
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Labs',
      description: 'Laboratory management endpoints'
    },
    {
      name: 'Materials',
      description: 'Material inventory management with AI categorization'
    },
    {
      name: 'Requests',
      description: 'Material request management with AI suggestions'
    },
    {
      name: 'Schedules',
      description: 'Lab scheduling and availability management'
    },
    {
      name: 'Chat',
      description: 'AI-powered chat assistant for inventory queries'
    },
    {
      name: 'Analytics',
      description: 'Inventory analytics and AI-powered insights'
    }
  ]
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: [
    './docs/schemas/*.js',
    './docs/paths/*.js',
    './routes/*.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Lab Inventory API Docs',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions
};
