import { Company, Contact, Sender } from '@prisma/client';

export const CONSTANTS = {};

export const APP_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

export const VALUES = {
  OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
  OPENAI_MODEL: 'deepseek/deepseek-r1-distill-qwen-32b:free',

  DEFAULT_PAGE_SIZE: 10,
};

export const ESPS = {
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  POSTMARK: 'postmark',
  BREVO: 'brevo',
  ELASTIC_EMAIL: 'elastic-email',
  MAILJET: 'mailjet',
};

export const EMAIL_TYPES = {
  EMAIL: 'email',
  FOLLOW_UP: 'followUp',
};

export const EMAIL_EVENTS = {
  PROCESSED: 'processed',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
};

export const EMAIL_PLACEHOLDERS: Record<
  string,
  keyof Company | keyof Contact | keyof Sender
> = {
  '{{COMPANY_NAME}}': 'title',
  '{{COMPANY_LOCATION}}': 'location',
  '{{CONTACT_NAME}}': 'name',
  '{{CONTACT_POSITION}}': 'position',
  '{{CONTACT_EMAIL}}': 'email',
  '{{CONTACT_PHONE}}': 'phone',
  '{{CONTACT_LINKEDIN_URL}}': 'linkedInUrl',
  '{{CONTACT_LOCATION}}': 'location',
  '{{SENDER_NAME}}': 'displayName',
};
