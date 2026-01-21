import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SJMC File Record API',
      version: '1.0.0',
      description: 'API documentation for the SJMC File Record Management System',
      contact: {
        name: 'SJMC Support',
        email: 'admin@sjmc.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/login endpoint'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              example: 'admin@sjmc.com',
              description: 'User email address'
            },
            password: {
              type: 'string',
              example: 'password123',
              description: 'User password'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  example: 'admin@sjmc.com'
                }
              }
            }
          }
        },
        PersonalFile: {
          type: 'object',
          required: ['name', 'age', 'gender'],
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            age: {
              type: 'number',
              example: 30
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              example: 'Male'
            },
            registrationDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              example: '2025-01-01'
            }
          }
        },
        FamilyFile: {
          type: 'object',
          required: ['headName', 'memberCount'],
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174001'
            },
            headName: {
              type: 'string',
              example: 'Jane Smith'
            },
            memberCount: {
              type: 'number',
              example: 4
            },
            registrationDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              example: '2025-01-01'
            }
          }
        },
        ReferralFile: {
          type: 'object',
          required: ['referralName', 'patientCount'],
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174002'
            },
            referralName: {
              type: 'string',
              example: 'Dr. Johnson'
            },
            patientCount: {
              type: 'number',
              example: 10
            },
            registrationDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              example: '2025-01-01'
            }
          }
        },
        EmergencyFile: {
          type: 'object',
          required: ['name', 'age', 'gender'],
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174003'
            },
            name: {
              type: 'string',
              example: 'Emergency Patient'
            },
            age: {
              type: 'number',
              example: 45
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              example: 'Female'
            },
            registrationDate: {
              type: 'string',
              format: 'date',
              example: '2024-01-01'
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              example: '2025-01-01'
            }
          }
        },
        Stats: {
          type: 'object',
          properties: {
            totalPersonal: {
              type: 'number',
              example: 100
            },
            totalFamily: {
              type: 'number',
              example: 50
            },
            totalReferral: {
              type: 'number',
              example: 25
            },
            totalEmergency: {
              type: 'number',
              example: 10
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    },
    security: []
  },
  apis: ['./api.ts', './server.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
