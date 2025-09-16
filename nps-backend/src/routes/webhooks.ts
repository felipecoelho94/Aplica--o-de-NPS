import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { webhookService } from '../services/webhookService';
import { AppError } from '../types';

export async function webhookRoutes(fastify: FastifyInstance) {
  // Zendesk webhook
  fastify.post(
    '/zendesk',
    {
      schema: {
        description: 'Zendesk webhook endpoint',
        tags: ['webhooks'],
        body: {
          type: 'object',
          properties: {
            ticket: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                status: { type: 'string' },
                subject: { type: 'string' },
                requester: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const signature = request.headers['x-zendesk-webhook-signature'] as string;
        const payload = request.body as any;

        // Verify webhook signature
        const isValid = await webhookService.verifyZendeskSignature(
          JSON.stringify(payload),
          signature
        );

        if (!isValid) {
          throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
        }

        // Process webhook
        await webhookService.processZendeskWebhook(payload);

        reply.status(200).send({
          success: true,
          data: { message: 'Webhook processed successfully' },
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

  // Sunshine Conversations webhook
  fastify.post(
    '/sunco',
    {
      schema: {
        description: 'Sunshine Conversations webhook endpoint',
        tags: ['webhooks'],
        body: {
          type: 'object',
          properties: {
            app: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
            trigger: { type: 'string' },
            version: { type: 'string' },
            timestamp: { type: 'number' },
            message: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                text: { type: 'string' },
                authorId: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const signature = request.headers['x-smooch-signature'] as string;
        const payload = request.body as any;

        // Verify webhook signature
        const isValid = await webhookService.verifySuncoSignature(
          JSON.stringify(payload),
          signature
        );

        if (!isValid) {
          throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
        }

        // Process webhook
        await webhookService.processSuncoWebhook(payload);

        reply.status(200).send({
          success: true,
          data: { message: 'Webhook processed successfully' },
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

  // Survey response webhook (for external integrations)
  fastify.post(
    '/survey-response',
    {
      schema: {
        description: 'Survey response webhook endpoint',
        tags: ['webhooks'],
        body: {
          type: 'object',
          required: ['surveyId', 'answers'],
          properties: {
            surveyId: { type: 'string' },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                required: ['questionId', 'value'],
                properties: {
                  questionId: { type: 'string' },
                  value: { type: 'string' },
                  text: { type: 'string' },
                },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                channel: { type: 'string' },
                userAgent: { type: 'string' },
                ipAddress: { type: 'string' },
                sessionId: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = request.body as any;
        
        // Process survey response
        const response = await webhookService.processSurveyResponse(payload);

        reply.status(200).send({
          success: true,
          data: response,
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
