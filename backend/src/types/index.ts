// Base types
export interface BaseEntity {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  entity: string;
  createdAt: string;
  updatedAt: string;
}

// Tenant types
export interface Tenant extends BaseEntity {
  entity: 'TENANT';
  name: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  timezone: string;
  language: string;
  integrations: {
    zendesk: ZendeskIntegration;
    sunco: SuncoIntegration;
  };
}

export interface ZendeskIntegration {
  enabled: boolean;
  subdomain: string;
  apiToken: string;
  webhookSecret: string;
}

export interface SuncoIntegration {
  enabled: boolean;
  appId: string;
  apiToken: string;
  webhookSecret: string;
}

// Survey types
export interface Survey extends BaseEntity {
  entity: 'SURVEY';
  tenantId: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  settings: SurveySettings;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
}

export interface SurveyQuestion {
  id: string;
  type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE';
  text: string;
  required: boolean;
  options?: string[];
  settings?: Record<string, any>;
}

export interface SurveySettings {
  allowAnonymous: boolean;
  maxResponses?: number;
  expiresAt?: string;
  channels: ('email' | 'whatsapp')[];
  templates: {
    email?: EmailTemplate;
    whatsapp?: WhatsAppTemplate;
  };
}

export interface EmailTemplate {
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
}

export interface WhatsAppTemplate {
  templateName: string;
  parameters: string[];
}

// Send types
export interface Send extends BaseEntity {
  entity: 'SEND';
  tenantId: string;
  surveyId: string;
  recipientId: string;
  channel: 'email' | 'whatsapp';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  metadata: SendMetadata;
}

export interface SendMetadata {
  recipient: {
    email?: string;
    phone?: string;
    name?: string;
  };
  template: {
    subject?: string;
    body?: string;
    templateName?: string;
  };
  tracking: {
    openId?: string;
    clickId?: string;
    responseId?: string;
  };
}

// Response types
export interface Response extends BaseEntity {
  entity: 'RESPONSE';
  tenantId: string;
  surveyId: string;
  sendId?: string;
  respondentId: string;
  answers: ResponseAnswer[];
  score?: number;
  category: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';
  completedAt: string;
  metadata: ResponseMetadata;
}

export interface ResponseAnswer {
  questionId: string;
  type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE';
  value: string | number;
  text?: string;
}

export interface ResponseMetadata {
  channel: 'email' | 'whatsapp' | 'web';
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  sessionId?: string;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  type: string;
  source: 'zendesk' | 'sunco' | 'internal';
  data: any;
  timestamp: string;
  signature?: string;
}

export interface ZendeskWebhookEvent extends WebhookEvent {
  source: 'zendesk';
  data: {
    ticket: {
      id: number;
      status: string;
      subject: string;
      requester: {
        email: string;
        name: string;
      };
    };
  };
}

export interface SuncoWebhookEvent extends WebhookEvent {
  source: 'sunco';
  data: {
    app: {
      id: string;
    };
    trigger: string;
    version: string;
    timestamp: number;
    message?: {
      id: string;
      type: string;
      text?: string;
      authorId: string;
    };
  };
}

// Error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Database types
export interface DynamoDBItem {
  [key: string]: any;
}

export interface QueryParams {
  TableName: string;
  KeyConditionExpression: string;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues: Record<string, any>;
  IndexName?: string;
  ScanIndexForward?: boolean;
  Limit?: number;
  ExclusiveStartKey?: Record<string, any>;
}

export interface PutItemParams {
  TableName: string;
  Item: DynamoDBItem;
  ConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
}

export interface UpdateItemParams {
  TableName: string;
  Key: Record<string, any>;
  UpdateExpression: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
  ConditionExpression?: string;
  ReturnValues?: 'ALL_NEW' | 'ALL_OLD' | 'NONE' | 'UPDATED_NEW' | 'UPDATED_OLD';
}
