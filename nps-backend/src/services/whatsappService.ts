import { config } from '../config';
import { logger } from '../utils/logger';
import { Survey } from '../types';

export interface SendWhatsAppData {
  to: string;
  name?: string;
  survey: Survey;
  sendId: string;
}

export class WhatsAppService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = config.sunco.baseUrl;
    this.apiToken = config.sunco.apiToken;
  }

  async sendSurvey(data: SendWhatsAppData): Promise<{ messageId: string }> {
    const { to, name, survey, sendId } = data;

    try {
      // In a real implementation, you would use the Sunshine Conversations API
      // For now, we'll simulate the API call
      
      const template = survey.settings.templates.whatsapp;
      if (!template) {
        throw new Error('WhatsApp template not configured for survey');
      }

      const message = this.generateWhatsAppMessage(template, survey, sendId, name);
      
      // Simulate API call to Sunshine Conversations
      const messageId = await this.sendMessage(to, message, sendId);

      logger.info('WhatsApp message sent successfully', {
        sendId,
        to,
        messageId,
      });

      return { messageId };
    } catch (error) {
      logger.error('Error sending WhatsApp message:', {
        sendId,
        to,
        error: error.message,
      });
      throw error;
    }
  }

  private async sendMessage(to: string, message: string, sendId: string): Promise<string> {
    // This is a mock implementation
    // In a real implementation, you would:
    // 1. Use the Sunshine Conversations API
    // 2. Send a proactive message using the configured template
    // 3. Handle the response and return the message ID

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Mock WhatsApp message sent', {
      to,
      messageId,
      sendId,
      message: message.substring(0, 100) + '...',
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return messageId;
  }

  private generateWhatsAppMessage(
    template: any,
    survey: Survey,
    sendId: string,
    name?: string
  ): string {
    const surveyUrl = `${config.api.baseUrl}/survey/${survey.id}?sendId=${sendId}`;
    
    // In a real implementation, you would use the WhatsApp Business API template
    // For now, we'll generate a simple text message
    return `
*${survey.title}*

Olá${name ? ` ${name}` : ''}! 👋

${survey.description || 'Gostaríamos muito de saber sua opinião sobre nossos serviços.'}

Sua resposta é muito importante para nós! 🙏

Responda nossa pesquisa aqui:
${surveyUrl}

Esta pesquisa levará apenas alguns minutos do seu tempo.

Obrigado pela sua participação! 😊
    `.trim();
  }

  // Real implementation would use Sunshine Conversations API
  private async sendProactiveMessage(
    userId: string,
    templateName: string,
    parameters: string[]
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v2/apps/${config.sunco.appId}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'text',
        text: {
          type: 'template',
          template: {
            name: templateName,
            parameters: parameters,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Sunshine Conversations API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messageId;
  }
}

export const whatsappService = new WhatsAppService();
