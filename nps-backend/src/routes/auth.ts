import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import { validateSignup, validateLogin } from '../validators/authValidators';
import { AppError } from '../types';

export async function authRoutes(fastify: FastifyInstance) {
  // Signup
  fastify.post(
    '/signup',
    {
      schema: {
        description: 'Register a new user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            tenantName: { type: 'string', minLength: 2 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                      tenantId: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  tokens: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                      expiresIn: { type: 'number' },
                    },
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
        const data = await validateSignup(request.body);
        const result = await authService.signup(data);
        
        reply.status(201).send({
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

  // Login
  fastify.post(
    '/login',
    {
      schema: {
        description: 'Authenticate user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                      tenantId: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  tokens: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                      expiresIn: { type: 'number' },
                    },
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
        const data = await validateLogin(request.body);
        const result = await authService.login(data);
        
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

  // Refresh token
  fastify.post(
    '/refresh',
    {
      schema: {
        description: 'Refresh access token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refreshToken } = request.body as { refreshToken: string };
        const result = await authService.refreshToken(refreshToken);
        
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

  // Logout
  fastify.post(
    '/logout',
    {
      schema: {
        description: 'Logout user',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        await authService.logout(user.id);
        
        reply.status(200).send({
          success: true,
          data: { message: 'Logged out successfully' },
        });
      } catch (error) {
        reply.status(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  // Get current user
  fastify.get(
    '/me',
    {
      schema: {
        description: 'Get current user information',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        
        reply.status(200).send({
          success: true,
          data: { user },
        });
      } catch (error) {
        reply.status(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );
}
