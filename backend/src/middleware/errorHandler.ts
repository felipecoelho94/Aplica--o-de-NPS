import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types';
import { logger } from '../utils/logger';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { AppError } = require('../types');
  
  // Log error
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: error.statusCode,
  });

  // Handle AppError (custom application errors)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.validation,
      },
    });
  }

  // Handle JWT errors
  if (error.message.includes('jwt')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido ou expirado',
      },
    });
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente mais tarde.',
      },
    });
  }

  // Handle 404 errors
  if (error.statusCode === 404) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado',
      },
    });
  }

  // Handle 405 errors
  if (error.statusCode === 405) {
    return reply.status(405).send({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Método não permitido',
      },
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Erro interno do servidor' : error.message;

  return reply.status(statusCode).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}
