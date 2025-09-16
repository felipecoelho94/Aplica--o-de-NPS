import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Response, ZendeskWebhookEvent, SuncoWebhookEvent } from '../types';
import { AppError } from '../types';

const dynamodb = new DynamoDB.DocumentClient({
  region: config.aws.region,
});

export class WebhookService {
  async verifyZendeskSignature(payload: string, signature: string): Promise<boolean> {
    try {
      const webhookSecret = config.zendesk.webhookSecret || 'dev-secret';
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Error verifying Zendesk signature:', error);
      return false;
    }
  }

  async verifySuncoSignature(payload: string, signature: string): Promise<boolean> {
    try {
      const webhookSecret = config.sunco.webhookSecret || 'dev-secret';
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('base64');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      );
    } catch (error) {
      logger.error('Error verifying Sunco signature:', error);
      return false;
    }
  }

  async processZendeskWebhook(payload: any): Promise<void> {
    try {
      const event: ZendeskWebhookEvent = {
        id: uuidv4(),
        type: 'ticket.created',
        source: 'zendesk',
        data: payload,
        timestamp: new Date().toISOString(),
      };

      // Store webhook event
      await dynamodb
        .put({
          TableName: config.aws.dynamodb.tableName,
          Item: {
            PK: `WEBHOOK#${event.id}`,
            SK: 'EVENT',
            GSI1PK: `SOURCE#zendesk`,
            GSI1SK: `EVENT#${event.timestamp}`,
            entity: 'WEBHOOK_EVENT',
            ...event,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
        .promise();

      // Process ticket creation for NPS survey
      if (payload.ticket) {
        await this.handleTicketCreated(payload.ticket);
      }

      logger.info('Zendesk webhook processed successfully', { eventId: event.id });
    } catch (error) {
      logger.error('Error processing Zendesk webhook:', error);
      throw error;
    }
  }

  async processSuncoWebhook(payload: any): Promise<void> {
    try {
      const event: SuncoWebhookEvent = {
        id: uuidv4(),
        type: payload.trigger || 'message.received',
        source: 'sunco',
        data: payload,
        timestamp: new Date().toISOString(),
      };

      // Store webhook event
      await dynamodb
        .put({
          TableName: config.aws.dynamodb.tableName,
          Item: {
            PK: `WEBHOOK#${event.id}`,
            SK: 'EVENT',
            GSI1PK: `SOURCE#sunco`,
            GSI1SK: `EVENT#${event.timestamp}`,
            entity: 'WEBHOOK_EVENT',
            ...event,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
        .promise();

      // Process message for NPS survey response
      if (payload.message) {
        await this.handleMessageReceived(payload.message);
      }

      logger.info('Sunco webhook processed successfully', { eventId: event.id });
    } catch (error) {
      logger.error('Error processing Sunco webhook:', error);
      throw error;
    }
  }

  async processSurveyResponse(payload: any): Promise<Response> {
    try {
      const { surveyId, answers, metadata = {} } = payload;

      // Get survey to validate
      const surveyResult = await dynamodb
        .get({
          TableName: config.aws.dynamodb.tableName,
          Key: {
            PK: `SURVEY#${surveyId}`,
            SK: 'METADATA',
          },
        })
        .promise();

      if (!surveyResult.Item) {
        throw new AppError('Survey not found', 404, 'SURVEY_NOT_FOUND');
      }

      const survey = surveyResult.Item;
      const responseId = uuidv4();
      const now = new Date().toISOString();

      // Calculate NPS score and category
      let score: number | undefined;
      let category: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR' | undefined;

      const npsAnswer = answers.find((a: any) => 
        survey.questions.find((q: any) => q.id === a.questionId && q.type === 'NPS')
      );

      if (npsAnswer) {
        score = parseInt(npsAnswer.value);
        if (score >= 9) {
          category = 'PROMOTER';
        } else if (score >= 7) {
          category = 'PASSIVE';
        } else {
          category = 'DETRACTOR';
        }
      }

      const response: Response = {
        PK: `RESPONSE#${responseId}`,
        SK: 'METADATA',
        GSI1PK: `SURVEY#${surveyId}`,
        GSI1SK: `RESPONSE#${responseId}`,
        entity: 'RESPONSE',
        id: responseId,
        tenantId: survey.tenantId,
        surveyId,
        respondentId: uuidv4(), // In a real app, this would be the actual user ID
        answers: answers.map((a: any) => ({
          questionId: a.questionId,
          type: survey.questions.find((q: any) => q.id === a.questionId)?.type || 'TEXT',
          value: a.value,
          text: a.text,
        })),
        score,
        category,
        completedAt: now,
        metadata: {
          channel: metadata.channel || 'web',
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          sessionId: metadata.sessionId,
        },
        createdAt: now,
        updatedAt: now,
      };

      await dynamodb
        .put({
          TableName: config.aws.dynamodb.tableName,
          Item: response,
        })
        .promise();

      logger.info('Survey response processed successfully', { 
        responseId, 
        surveyId, 
        score, 
        category 
      });

      return response;
    } catch (error) {
      logger.error('Error processing survey response:', error);
      throw error;
    }
  }

  private async handleTicketCreated(ticket: any): Promise<void> {
    // In a real implementation, this would:
    // 1. Check if the ticket is from a customer who should receive an NPS survey
    // 2. Create a survey send record
    // 3. Queue the survey for sending
    
    logger.info('Ticket created event received', { 
      ticketId: ticket.id, 
      requesterEmail: ticket.requester?.email 
    });
  }

  private async handleMessageReceived(message: any): Promise<void> {
    // In a real implementation, this would:
    // 1. Check if the message is a response to an NPS survey
    // 2. Parse the response and create a response record
    // 3. Update the send status
    
    logger.info('Message received event', { 
      messageId: message.id, 
      authorId: message.authorId,
      text: message.text 
    });
  }
}

export const webhookService = new WebhookService();
