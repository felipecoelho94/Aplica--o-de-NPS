import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { logger } from './utils/logger';
import { authRoutes } from './routes/auth';
import { surveyRoutes } from './routes/surveys';
import { webhookRoutes } from './routes/webhooks';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

const fastify = Fastify({
  logger: logger,
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  genReqId: () => crypto.randomUUID(),
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: config.cors.origins,
    credentials: true,
  });

  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });

  // JWT
  await fastify.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  });

  // Multipart
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'NPS SaaS API',
        description: 'API para sistema de pesquisas NPS integrado ao Zendesk',
        version: '1.0.0',
      },
      servers: [
        {
          url: config.api.baseUrl,
          description: 'API Server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  await fastify.register(healthRoutes, { prefix: '/health' });

  // Auth routes
  await fastify.register(authRoutes, { prefix: '/v1/auth' });

  // Survey routes (protected)
  await fastify.register(surveyRoutes, { prefix: '/v1/surveys' });

  // Webhook routes
  await fastify.register(webhookRoutes, { prefix: '/webhooks' });
}

// Register middleware
async function registerMiddleware() {
  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Auth middleware for protected routes
  fastify.addHook('preHandler', authMiddleware);
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();
    await registerMiddleware();

    const port = config.server.port;
    const host = config.server.host;

    await fastify.listen({ port, host });
    
    logger.info(`Server listening on http://${host}:${port}`);
    logger.info(`API Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  start();
}

export { fastify };
