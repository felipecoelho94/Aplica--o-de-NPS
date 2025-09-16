import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthCheck } from '../services/healthService';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await healthCheck();
      
      reply.status(200).send({
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      reply.status(503).send({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Health check failed',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Readiness check
  fastify.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await healthCheck();
      
      if (health.status === 'healthy') {
        reply.status(200).send({
          success: true,
          data: { status: 'ready' },
        });
      } else {
        reply.status(503).send({
          success: false,
          error: {
            code: 'NOT_READY',
            message: 'Service not ready',
          },
        });
      }
    } catch (error) {
      reply.status(503).send({
        success: false,
        error: {
          code: 'READINESS_CHECK_FAILED',
          message: 'Readiness check failed',
        },
      });
    }
  });

  // Liveness check
  fastify.get('/live', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.status(200).send({
      success: true,
      data: { status: 'alive' },
      timestamp: new Date().toISOString(),
    });
  });
}
