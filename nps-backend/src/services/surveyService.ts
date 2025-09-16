import { DynamoDB, SQS } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Survey, Send, Response, PaginationParams, FilterParams } from '../types';
import { AppError } from '../types';

const dynamodb = new DynamoDB.DocumentClient({
  region: config.aws.region,
});

const sqs = new SQS({
  region: config.aws.region,
});

export interface CreateSurveyData {
  title: string;
  description?: string;
  questions: Array<{
    type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE';
    text: string;
    required: boolean;
    options?: string[];
  }>;
  settings?: {
    allowAnonymous?: boolean;
    maxResponses?: number;
    expiresAt?: string;
    channels?: ('email' | 'whatsapp')[];
  };
}

export interface UpdateSurveyData {
  title?: string;
  description?: string;
  questions?: Array<{
    type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE';
    text: string;
    required: boolean;
    options?: string[];
  }>;
  settings?: {
    allowAnonymous?: boolean;
    maxResponses?: number;
    expiresAt?: string;
    channels?: ('email' | 'whatsapp')[];
  };
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
}

export interface SendSurveyData {
  recipients: Array<{
    email: string;
    name?: string;
    phone?: string;
  }>;
  channel: 'email' | 'whatsapp';
  scheduledAt?: string;
}

export class SurveyService {
  async getSurveys(tenantId: string, params: PaginationParams & FilterParams) {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const queryParams: any = {
      TableName: config.aws.dynamodb.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
      ExpressionAttributeValues: {
        ':gsi1pk': `TENANT#${tenantId}`,
        ':gsi1sk': 'SURVEY#',
      },
      ScanIndexForward: sortOrder === 'asc',
      Limit: limit,
    };

    if (status) {
      queryParams.FilterExpression = '#status = :status';
      queryParams.ExpressionAttributeNames = {
        '#status': 'status',
      };
      queryParams.ExpressionAttributeValues[':status'] = status;
    }

    const result = await dynamodb.query(queryParams).promise();
    
    const surveys = (result.Items || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      surveys,
      total: result.Count || 0,
    };
  }

  async getSurveyById(surveyId: string, tenantId: string): Promise<Survey> {
    const result = await dynamodb
      .get({
        TableName: config.aws.dynamodb.tableName,
        Key: {
          PK: `SURVEY#${surveyId}`,
          SK: 'METADATA',
        },
      })
      .promise();

    if (!result.Item) {
      throw new AppError('Survey not found', 404, 'SURVEY_NOT_FOUND');
    }

    if (result.Item.tenantId !== tenantId) {
      throw new AppError('Survey not found', 404, 'SURVEY_NOT_FOUND');
    }

    return result.Item as Survey;
  }

  async createSurvey(data: CreateSurveyData, tenantId: string, userId: string): Promise<Survey> {
    const surveyId = uuidv4();
    const now = new Date().toISOString();

    const survey: Survey = {
      PK: `SURVEY#${surveyId}`,
      SK: 'METADATA',
      GSI1PK: `TENANT#${tenantId}`,
      GSI1SK: `SURVEY#${surveyId}`,
      entity: 'SURVEY',
      id: surveyId,
      tenantId,
      title: data.title,
      description: data.description,
      questions: data.questions.map(q => ({
        ...q,
        id: uuidv4(),
      })),
      settings: {
        allowAnonymous: data.settings?.allowAnonymous ?? true,
        maxResponses: data.settings?.maxResponses,
        expiresAt: data.settings?.expiresAt,
        channels: data.settings?.channels || ['email'],
        templates: {
          email: {
            subject: `Pesquisa NPS: ${data.title}`,
            body: 'Olá! Gostaríamos de saber sua opinião sobre nossos serviços.',
            fromName: 'Equipe NPS',
            fromEmail: 'noreply@nps-saas.com',
          },
        },
      },
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb
      .put({
        TableName: config.aws.dynamodb.tableName,
        Item: survey,
      })
      .promise();

    logger.info('Survey created successfully', { surveyId, tenantId, userId });

    return survey;
  }

  async updateSurvey(surveyId: string, data: UpdateSurveyData, tenantId: string): Promise<Survey> {
    const existingSurvey = await this.getSurveyById(surveyId, tenantId);

    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.title !== undefined) {
      updateExpression.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = data.title;
    }

    if (data.description !== undefined) {
      updateExpression.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = data.description;
    }

    if (data.questions !== undefined) {
      updateExpression.push('#questions = :questions');
      expressionAttributeNames['#questions'] = 'questions';
      expressionAttributeValues[':questions'] = data.questions.map(q => ({
        ...q,
        id: q.id || uuidv4(),
      }));
    }

    if (data.settings !== undefined) {
      updateExpression.push('#settings = :settings');
      expressionAttributeNames['#settings'] = 'settings';
      expressionAttributeValues[':settings'] = {
        ...existingSurvey.settings,
        ...data.settings,
      };
    }

    if (data.status !== undefined) {
      updateExpression.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = data.status;
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamodb
      .update({
        TableName: config.aws.dynamodb.tableName,
        Key: {
          PK: `SURVEY#${surveyId}`,
          SK: 'METADATA',
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    logger.info('Survey updated successfully', { surveyId, tenantId });

    return result.Attributes as Survey;
  }

  async deleteSurvey(surveyId: string, tenantId: string): Promise<void> {
    // Verify survey exists and belongs to tenant
    await this.getSurveyById(surveyId, tenantId);

    await dynamodb
      .delete({
        TableName: config.aws.dynamodb.tableName,
        Key: {
          PK: `SURVEY#${surveyId}`,
          SK: 'METADATA',
        },
      })
      .promise();

    logger.info('Survey deleted successfully', { surveyId, tenantId });
  }

  async sendSurvey(surveyId: string, data: SendSurveyData, tenantId: string) {
    const survey = await this.getSurveyById(surveyId, tenantId);

    if (survey.status !== 'ACTIVE') {
      throw new AppError('Survey must be active to send', 400, 'SURVEY_NOT_ACTIVE');
    }

    const sendId = uuidv4();
    const now = new Date().toISOString();

    // Create send records for each recipient
    const sends: Send[] = data.recipients.map(recipient => ({
      PK: `SEND#${sendId}`,
      SK: `RECIPIENT#${recipient.email}`,
      GSI1PK: `SURVEY#${surveyId}`,
      GSI1SK: `SEND#${sendId}`,
      entity: 'SEND',
      id: sendId,
      tenantId,
      surveyId,
      recipientId: recipient.email,
      channel: data.channel,
      status: 'PENDING',
      scheduledAt: data.scheduledAt || now,
      metadata: {
        recipient: {
          email: recipient.email,
          name: recipient.name,
          phone: recipient.phone,
        },
        template: {
          subject: survey.settings.templates.email?.subject,
          body: survey.settings.templates.email?.body,
        },
      },
      createdAt: now,
      updatedAt: now,
    }));

    // Save send records to DynamoDB
    const putRequests = sends.map(send => ({
      PutRequest: {
        Item: send,
      },
    }));

    await dynamodb
      .batchWrite({
        RequestItems: {
          [config.aws.dynamodb.tableName]: putRequests,
        },
      })
      .promise();

    // Send message to SQS for processing
    await sqs
      .sendMessage({
        QueueUrl: config.aws.sqs.queueUrl,
        MessageBody: JSON.stringify({
          sendId,
          surveyId,
          tenantId,
          channel: data.channel,
          recipients: data.recipients,
          scheduledAt: data.scheduledAt || now,
        }),
        MessageAttributes: {
          sendId: {
            DataType: 'String',
            StringValue: sendId,
          },
          surveyId: {
            DataType: 'String',
            StringValue: surveyId,
          },
          tenantId: {
            DataType: 'String',
            StringValue: tenantId,
          },
        },
      })
      .promise();

    logger.info('Survey send queued successfully', { sendId, surveyId, tenantId, recipientCount: data.recipients.length });

    return {
      sendId,
      surveyId,
      recipientCount: data.recipients.length,
      status: 'QUEUED',
    };
  }

  async getSurveyResponses(surveyId: string, tenantId: string, params: PaginationParams & FilterParams) {
    const { page = 1, limit = 20, dateFrom, dateTo } = params;

    // Verify survey exists and belongs to tenant
    await this.getSurveyById(surveyId, tenantId);

    const queryParams: any = {
      TableName: config.aws.dynamodb.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
      ExpressionAttributeValues: {
        ':gsi1pk': `SURVEY#${surveyId}`,
        ':gsi1sk': 'RESPONSE#',
      },
      ScanIndexForward: false,
      Limit: limit,
    };

    if (dateFrom || dateTo) {
      queryParams.FilterExpression = [];
      queryParams.ExpressionAttributeNames = {};

      if (dateFrom) {
        queryParams.FilterExpression.push('#completedAt >= :dateFrom');
        queryParams.ExpressionAttributeNames['#completedAt'] = 'completedAt';
        queryParams.ExpressionAttributeValues[':dateFrom'] = dateFrom;
      }

      if (dateTo) {
        queryParams.FilterExpression.push('#completedAt <= :dateTo');
        queryParams.ExpressionAttributeNames['#completedAt'] = 'completedAt';
        queryParams.ExpressionAttributeValues[':dateTo'] = dateTo;
      }

      queryParams.FilterExpression = queryParams.FilterExpression.join(' AND ');
    }

    const result = await dynamodb.query(queryParams).promise();

    const responses = (result.Items || []).map(item => ({
      id: item.id,
      surveyId: item.surveyId,
      answers: item.answers,
      score: item.score,
      category: item.category,
      completedAt: item.completedAt,
      metadata: item.metadata,
    }));

    return {
      responses,
      total: result.Count || 0,
    };
  }
}

export const surveyService = new SurveyService();
