import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { fastify } from './index';
import { logger } from './utils/logger';

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  try {
    // Convert API Gateway event to Fastify request
    const url = `https://${event.headers.Host || event.requestContext.domainName}${event.path}`;
    const method = event.httpMethod;
    const headers = event.headers as Record<string, string>;
    const query = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : undefined;

    // Create a mock request object
    const request = {
      method,
      url,
      headers,
      query,
      body,
      raw: {
        body: event.body,
      },
    };

    // Create a mock reply object
    let statusCode = 200;
    let responseBody: any = {};
    let responseHeaders: Record<string, string> = {};

    const reply = {
      status: (code: number) => {
        statusCode = code;
        return reply;
      },
      send: (data: any) => {
        responseBody = data;
        return reply;
      },
      header: (name: string, value: string) => {
        responseHeaders[name] = value;
        return reply;
      },
      type: (type: string) => {
        responseHeaders['Content-Type'] = type;
        return reply;
      },
    };

    // Process the request through Fastify
    await fastify.inject({
      method: method as any,
      url,
      headers,
      query,
      payload: body,
    });

    // Return API Gateway response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        ...responseHeaders,
      },
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    logger.error('Lambda handler error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      }),
    };
  }
}
