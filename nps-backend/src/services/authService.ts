import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { User, AuthTokens, Tenant } from '../types';
import { AppError } from '../types';

const dynamodb = new DynamoDB.DocumentClient({
  region: config.aws.region,
});

export interface SignupData {
  email: string;
  password: string;
  name: string;
  tenantName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export class AuthService {
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateTokens(user: User): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  async signup(data: SignupData): Promise<AuthResult> {
    const { email, password, name, tenantName } = data;

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    const userId = uuidv4();
    const tenantId = uuidv4();
    const hashedPassword = await this.hashPassword(password);
    const now = new Date().toISOString();

    // Create tenant if tenantName is provided
    if (tenantName) {
      const tenant: Tenant = {
        PK: `TENANT#${tenantId}`,
        SK: 'METADATA',
        GSI1PK: `TENANT#${tenantId}`,
        GSI1SK: 'METADATA',
        entity: 'TENANT',
        name: tenantName,
        settings: {
          timezone: 'UTC',
          language: 'pt-BR',
          integrations: {
            zendesk: {
              enabled: false,
              subdomain: '',
              apiToken: '',
              webhookSecret: '',
            },
            sunco: {
              enabled: false,
              appId: '',
              apiToken: '',
              webhookSecret: '',
            },
          },
        },
        createdAt: now,
        updatedAt: now,
      };

      await dynamodb
        .put({
          TableName: config.aws.dynamodb.tableName,
          Item: tenant,
        })
        .promise();
    }

    // Create user
    const user: User = {
      id: userId,
      email,
      name,
      tenantId,
      role: 'ADMIN',
      createdAt: now,
      updatedAt: now,
    };

    const userItem = {
      PK: `USER#${userId}`,
      SK: 'METADATA',
      GSI1PK: `TENANT#${tenantId}`,
      GSI1SK: `USER#${userId}`,
      entity: 'USER',
      ...user,
      password: hashedPassword,
    };

    await dynamodb
      .put({
        TableName: config.aws.dynamodb.tableName,
        Item: userItem,
      })
      .promise();

    const tokens = this.generateTokens(user);

    logger.info('User created successfully', { userId, email, tenantId });

    return { user, tokens };
  }

  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    const userItem = await this.getUserByEmail(email);
    if (!userItem) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await this.comparePassword(password, userItem.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const user: User = {
      id: userItem.id,
      email: userItem.email,
      name: userItem.name,
      tenantId: userItem.tenantId,
      role: userItem.role,
      createdAt: userItem.createdAt,
      updatedAt: userItem.updatedAt,
    };

    const tokens = this.generateTokens(user);

    logger.info('User logged in successfully', { userId: user.id, email });

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401, 'INVALID_TOKEN');
      }

      const userItem = await this.getUserById(decoded.id);
      if (!userItem) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const user: User = {
        id: userItem.id,
        email: userItem.email,
        name: userItem.name,
        tenantId: userItem.tenantId,
        role: userItem.role,
        createdAt: userItem.createdAt,
        updatedAt: userItem.updatedAt,
      };

      const tokens = this.generateTokens(user);

      logger.info('Token refreshed successfully', { userId: user.id });

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    // In a real implementation, you would invalidate the refresh token
    // by storing it in a blacklist or updating the user record
    logger.info('User logged out', { userId });
  }

  async getUserByEmail(email: string): Promise<any> {
    const result = await dynamodb
      .query({
        TableName: config.aws.dynamodb.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
        ExpressionAttributeValues: {
          ':gsi1pk': `USER#EMAIL#${email}`,
          ':gsi1sk': 'METADATA',
        },
      })
      .promise();

    return result.Items?.[0];
  }

  async getUserById(userId: string): Promise<any> {
    const result = await dynamodb
      .get({
        TableName: config.aws.dynamodb.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: 'METADATA',
        },
      })
      .promise();

    return result.Item;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
