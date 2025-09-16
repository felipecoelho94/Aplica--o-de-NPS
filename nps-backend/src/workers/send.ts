import { DynamoDB, SQS } from 'aws-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Send } from '../types';
import { emailService } from '../services/emailService';
import { whatsappService } from '../services/whatsappService';

const dynamodb = new DynamoDB.DocumentClient({
  region: config.aws.region,
});

const sqs = new SQS({
  region: config.aws.region,
});

interface SendMessage {
  sendId: string;
  surveyId: string;
  tenantId: string;
  channel: 'email' | 'whatsapp';
  recipients: Array<{
    email: string;
    name?: string;
    phone?: string;
  }>;
  scheduledAt: string;
}

export async function handler(event: any) {
  logger.info('Send worker started', { recordCount: event.Records?.length || 0 });

  for (const record of event.Records || []) {
    try {
      const message: SendMessage = JSON.parse(record.body);
      await processSendMessage(message);
    } catch (error) {
      logger.error('Error processing send message:', error);
      
      // In a real implementation, you would:
      // 1. Log the error to CloudWatch
      // 2. Send to Dead Letter Queue if max retries exceeded
      // 3. Send alert to monitoring system
    }
  }

  logger.info('Send worker completed');
}

async function processSendMessage(message: SendMessage) {
  const { sendId, surveyId, tenantId, channel, recipients, scheduledAt } = message;

  try {
    // Get survey details
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
      throw new Error(`Survey not found: ${surveyId}`);
    }

    const survey = surveyResult.Item;

    // Check if send is scheduled for the future
    const scheduledTime = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduledTime > now) {
      logger.info('Send scheduled for future, requeuing', { 
        sendId, 
        scheduledAt,
        delaySeconds: Math.ceil((scheduledTime.getTime() - now.getTime()) / 1000)
      });
      
      // Requeue with delay
      await sqs
        .sendMessage({
          QueueUrl: config.aws.sqs.queueUrl,
          MessageBody: JSON.stringify(message),
          DelaySeconds: Math.min(900, Math.ceil((scheduledTime.getTime() - now.getTime()) / 1000)),
        })
        .promise();
      
      return;
    }

    // Process each recipient
    for (const recipient of recipients) {
      try {
        await processRecipient(sendId, survey, recipient, channel, tenantId);
      } catch (error) {
        logger.error('Error processing recipient:', { 
          sendId, 
          recipient: recipient.email, 
          error: error.message 
        });
        
        // Update send status to failed
        await updateSendStatus(sendId, recipient.email, 'FAILED', error.message);
      }
    }

    logger.info('Send message processed successfully', { sendId, recipientCount: recipients.length });
  } catch (error) {
    logger.error('Error processing send message:', { sendId, error: error.message });
    throw error;
  }
}

async function processRecipient(
  sendId: string,
  survey: any,
  recipient: { email: string; name?: string; phone?: string },
  channel: 'email' | 'whatsapp',
  tenantId: string
) {
  const now = new Date().toISOString();

  try {
    // Update send status to SENT
    await updateSendStatus(sendId, recipient.email, 'SENT');

    let result: any;

    if (channel === 'email') {
      result = await emailService.sendSurvey({
        to: recipient.email,
        name: recipient.name,
        survey,
        sendId,
      });
    } else if (channel === 'whatsapp') {
      result = await whatsappService.sendSurvey({
        to: recipient.phone || recipient.email,
        name: recipient.name,
        survey,
        sendId,
      });
    } else {
      throw new Error(`Unsupported channel: ${channel}`);
    }

    // Update send status to DELIVERED
    await updateSendStatus(sendId, recipient.email, 'DELIVERED', undefined, result.messageId);

    logger.info('Survey sent successfully', {
      sendId,
      recipient: recipient.email,
      channel,
      messageId: result.messageId,
    });
  } catch (error) {
    logger.error('Error sending survey:', {
      sendId,
      recipient: recipient.email,
      channel,
      error: error.message,
    });

    // Update send status to FAILED
    await updateSendStatus(sendId, recipient.email, 'FAILED', error.message);

    throw error;
  }
}

async function updateSendStatus(
  sendId: string,
  recipientEmail: string,
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED',
  errorMessage?: string,
  messageId?: string
) {
  const now = new Date().toISOString();
  const updateExpression = ['#status = :status', '#updatedAt = :updatedAt'];
  const expressionAttributeNames: Record<string, string> = {
    '#status': 'status',
    '#updatedAt': 'updatedAt',
  };
  const expressionAttributeValues: Record<string, any> = {
    ':status': status,
    ':updatedAt': now,
  };

  if (status === 'SENT') {
    updateExpression.push('#sentAt = :sentAt');
    expressionAttributeNames['#sentAt'] = 'sentAt';
    expressionAttributeValues[':sentAt'] = now;
  }

  if (status === 'DELIVERED') {
    updateExpression.push('#deliveredAt = :deliveredAt');
    expressionAttributeNames['#deliveredAt'] = 'deliveredAt';
    expressionAttributeValues[':deliveredAt'] = now;
  }

  if (status === 'FAILED') {
    updateExpression.push('#failedAt = :failedAt', '#errorMessage = :errorMessage');
    expressionAttributeNames['#failedAt'] = 'failedAt';
    expressionAttributeNames['#errorMessage'] = 'errorMessage';
    expressionAttributeValues[':failedAt'] = now;
    expressionAttributeValues[':errorMessage'] = errorMessage;
  }

  if (messageId) {
    updateExpression.push('#messageId = :messageId');
    expressionAttributeNames['#messageId'] = 'messageId';
    expressionAttributeValues[':messageId'] = messageId;
  }

  await dynamodb
    .update({
      TableName: config.aws.dynamodb.tableName,
      Key: {
        PK: `SEND#${sendId}`,
        SK: `RECIPIENT#${recipientEmail}`,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
    .promise();
}
