import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import { AppError } from '../types';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Skip auth for public routes
  const publicRoutes = [
    '/health',
    '/v1/auth/signup',
    '/v1/auth/login',
    '/v1/auth/refresh',
    '/webhooks',
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    request.url.startsWith(route)
  );

  if (isPublicRoute) {
    return;
  }

  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autorização não fornecido', 401, 'MISSING_TOKEN');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = await authService.verifyToken(token);
    
    // Add user info to request
    (request as any).user = decoded;
    
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
      reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token inválido ou expirado',
        },
      });
    }
  }
}
