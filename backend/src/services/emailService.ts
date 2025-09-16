import { SES } from 'aws-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Survey } from '../types';

const ses = new SES({
  region: config.aws.region,
});

export interface SendEmailData {
  to: string;
  name?: string;
  survey: Survey;
  sendId: string;
}

export class EmailService {
  async sendSurvey(data: SendEmailData): Promise<{ messageId: string }> {
    const { to, name, survey, sendId } = data;

    try {
      const template = survey.settings.templates.email;
      if (!template) {
        throw new Error('Email template not configured for survey');
      }

      const subject = template.subject;
      const body = this.generateEmailBody(template.body, survey, sendId, name);

      const params = {
        Source: `${template.fromName} <${template.fromEmail}>`,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: body,
              Charset: 'UTF-8',
            },
            Text: {
              Data: this.generateTextBody(template.body, survey, sendId, name),
              Charset: 'UTF-8',
            },
          },
        },
        Tags: [
          {
            Name: 'SendId',
            Value: sendId,
          },
          {
            Name: 'SurveyId',
            Value: survey.id,
          },
          {
            Name: 'Type',
            Value: 'NPS_SURVEY',
          },
        ],
      };

      const result = await ses.sendEmail(params).promise();

      logger.info('Email sent successfully', {
        sendId,
        to,
        messageId: result.MessageId,
      });

      return { messageId: result.MessageId };
    } catch (error) {
      logger.error('Error sending email:', {
        sendId,
        to,
        error: error.message,
      });
      throw error;
    }
  }

  private generateEmailBody(
    template: string,
    survey: Survey,
    sendId: string,
    name?: string
  ): string {
    const surveyUrl = `${config.api.baseUrl}/survey/${survey.id}?sendId=${sendId}`;
    const unsubscribeUrl = `${config.api.baseUrl}/unsubscribe?sendId=${sendId}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${survey.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
          }
          .unsubscribe { color: #666; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${survey.title}</h1>
          </div>
          <div class="content">
            <p>Olá${name ? ` ${name}` : ''},</p>
            <p>${template}</p>
            ${survey.description ? `<p>${survey.description}</p>` : ''}
            <p>Gostaríamos muito de saber sua opinião sobre nossos serviços. Sua resposta é muito importante para nós!</p>
            <div style="text-align: center;">
              <a href="${surveyUrl}" class="button">Responder Pesquisa</a>
            </div>
            <p>Esta pesquisa levará apenas alguns minutos do seu tempo.</p>
          </div>
          <div class="footer">
            <p>Obrigado pela sua participação!</p>
            <p>
              <a href="${unsubscribeUrl}" class="unsubscribe">Cancelar inscrição</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTextBody(
    template: string,
    survey: Survey,
    sendId: string,
    name?: string
  ): string {
    const surveyUrl = `${config.api.baseUrl}/survey/${survey.id}?sendId=${sendId}`;
    const unsubscribeUrl = `${config.api.baseUrl}/unsubscribe?sendId=${sendId}`;

    return `
${survey.title}

Olá${name ? ` ${name}` : ''},

${template}

${survey.description ? `${survey.description}\n` : ''}

Gostaríamos muito de saber sua opinião sobre nossos serviços. Sua resposta é muito importante para nós!

Responda a pesquisa aqui: ${surveyUrl}

Esta pesquisa levará apenas alguns minutos do seu tempo.

Obrigado pela sua participação!

---
Cancelar inscrição: ${unsubscribeUrl}
    `.trim();
  }
}

export const emailService = new EmailService();
