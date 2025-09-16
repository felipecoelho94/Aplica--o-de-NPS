import { DynamoDB } from 'aws-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';

const dynamodb = new DynamoDB.DocumentClient({
  region: config.aws.region,
});

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: 'up' | 'down';
    aws: 'up' | 'down';
  };
  timestamp: string;
  uptime: number;
  version: string;
}

export async function healthCheck(): Promise<HealthStatus> {
  const startTime = Date.now();
  const checks = {
    database: 'down' as 'up' | 'down',
    aws: 'down' as 'up' | 'down',
  };

  // Check DynamoDB connection
  try {
    await dynamodb
      .scan({
        TableName: config.aws.dynamodb.tableName,
        Limit: 1,
      })
      .promise();
    checks.database = 'up';
  } catch (error) {
    logger.error('Database health check failed:', error);
    checks.database = 'down';
  }

  // Check AWS credentials and region
  try {
    const sts = new DynamoDB({
      region: config.aws.region,
    });
    await sts.describeTable({ TableName: config.aws.dynamodb.tableName }).promise();
    checks.aws = 'up';
  } catch (error) {
    logger.error('AWS health check failed:', error);
    checks.aws = 'down';
  }

  const isHealthy = checks.database === 'up' && checks.aws === 'up';

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  };
}
