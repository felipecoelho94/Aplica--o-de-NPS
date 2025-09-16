import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { surveyService } from '../services/surveyService';
import { validateCreateSurvey, validateUpdateSurvey } from '../validators/surveyValidators';
import { AppError } from '../types';

export async function surveyRoutes(fastify: FastifyInstance) {
  // Get all surveys
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all surveys for the current tenant',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'] },
            sortBy: { type: 'string', default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const query = request.query as any;
        
        const result = await surveyService.getSurveys(user.tenantId, query);
        
        reply.status(200).send({
          success: true,
          data: result.surveys,
          meta: {
            page: query.page,
            limit: query.limit,
            total: result.total,
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );

  // Get survey by ID
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get survey by ID',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        
        const survey = await surveyService.getSurveyById(id, user.tenantId);
        
        reply.status(200).send({
          success: true,
          data: survey,
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );

  // Create survey
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new survey',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['title', 'questions'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'text'],
                properties: {
                  type: { type: 'string', enum: ['NPS', 'TEXT', 'RATING', 'CHOICE'] },
                  text: { type: 'string', minLength: 1, maxLength: 500 },
                  required: { type: 'boolean', default: true },
                  options: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            settings: {
              type: 'object',
              properties: {
                allowAnonymous: { type: 'boolean', default: true },
                maxResponses: { type: 'number', minimum: 1 },
                expiresAt: { type: 'string', format: 'date-time' },
                channels: {
                  type: 'array',
                  items: { type: 'string', enum: ['email', 'whatsapp'] },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const data = await validateCreateSurvey(request.body);
        
        const survey = await surveyService.createSurvey(data, user.tenantId, user.id);
        
        reply.status(201).send({
          success: true,
          data: survey,
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );

  // Update survey
  fastify.put(
    '/:id',
    {
      schema: {
        description: 'Update survey',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'text'],
                properties: {
                  type: { type: 'string', enum: ['NPS', 'TEXT', 'RATING', 'CHOICE'] },
                  text: { type: 'string', minLength: 1, maxLength: 500 },
                  required: { type: 'boolean' },
                  options: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            settings: {
              type: 'object',
              properties: {
                allowAnonymous: { type: 'boolean' },
                maxResponses: { type: 'number', minimum: 1 },
                expiresAt: { type: 'string', format: 'date-time' },
                channels: {
                  type: 'array',
                  items: { type: 'string', enum: ['email', 'whatsapp'] },
                },
              },
            },
            status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'] },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const data = await validateUpdateSurvey(request.body);
        
        const survey = await surveyService.updateSurvey(id, data, user.tenantId);
        
        reply.status(200).send({
          success: true,
          data: survey,
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );

  // Delete survey
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete survey',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        
        await surveyService.deleteSurvey(id, user.tenantId);
        
        reply.status(200).send({
          success: true,
          data: { message: 'Survey deleted successfully' },
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );

  // Send survey
  fastify.post(
    '/:id/send',
    {
      schema: {
        description: 'Send survey to recipients',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          required: ['recipients'],
          properties: {
            recipients: {
              type: 'array',
              items: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
            channel: { type: 'string', enum: ['email', 'whatsapp'], default: 'email' },
            scheduledAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const data = request.body as any;
        
        const result = await surveyService.sendSurvey(id, data, user.tenantId);
        
        reply.status(200).send({
          success: true,
          data: result,
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );

  // Get survey responses
  fastify.get(
    '/:id/responses',
    {
      schema: {
        description: 'Get survey responses',
        tags: ['surveys'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            dateFrom: { type: 'string', format: 'date-time' },
            dateTo: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const query = request.query as any;
        
        const result = await surveyService.getSurveyResponses(id, user.tenantId, query);
        
        reply.status(200).send({
          success: true,
          data: result.responses,
          meta: {
            page: query.page,
            limit: query.limit,
            total: result.total,
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          });
        } else {
          reply.status(500).send({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          });
        }
      }
    }
  );
}
