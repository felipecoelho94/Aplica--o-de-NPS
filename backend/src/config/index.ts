import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    version: 'v1',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodb: {
      tableName: process.env.DYNAMODB_TABLE_NAME || 'nps-app-table-dev',
    },
    s3: {
      bucketName: process.env.S3_BUCKET_NAME || 'nps-assets-dev',
    },
    sqs: {
      queueUrl: process.env.SQS_QUEUE_URL || '',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || '1 minute',
  },
  zendesk: {
    apiToken: process.env.ZENDESK_API_TOKEN || '',
    subdomain: process.env.ZENDESK_SUBDOMAIN || '',
    baseUrl: process.env.ZENDESK_BASE_URL || '',
  },
  sunco: {
    apiToken: process.env.SUNCO_API_TOKEN || '',
    baseUrl: process.env.SUNCO_BASE_URL || 'https://api.smooch.io',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.LOG_PRETTY === 'true',
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'DYNAMODB_TABLE_NAME',
  'S3_BUCKET_NAME',
  'SQS_QUEUE_URL',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}
