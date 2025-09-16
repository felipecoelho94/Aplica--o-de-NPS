import Joi from 'joi';

const questionSchema = Joi.object({
  type: Joi.string().valid('NPS', 'TEXT', 'RATING', 'CHOICE').required().messages({
    'any.only': 'Tipo da pergunta deve ser NPS, TEXT, RATING ou CHOICE',
    'any.required': 'Tipo da pergunta é obrigatório',
  }),
  text: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Texto da pergunta deve ter pelo menos 1 caractere',
    'string.max': 'Texto da pergunta deve ter no máximo 500 caracteres',
    'any.required': 'Texto da pergunta é obrigatório',
  }),
  required: Joi.boolean().default(true),
  options: Joi.array().items(Joi.string().min(1).max(100)).when('type', {
    is: 'CHOICE',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    'any.required': 'Opções são obrigatórias para perguntas do tipo CHOICE',
  }),
});

const settingsSchema = Joi.object({
  allowAnonymous: Joi.boolean().default(true),
  maxResponses: Joi.number().integer().min(1).optional(),
  expiresAt: Joi.date().iso().optional(),
  channels: Joi.array().items(
    Joi.string().valid('email', 'whatsapp')
  ).min(1).default(['email']).messages({
    'any.only': 'Canais devem ser email ou whatsapp',
    'array.min': 'Pelo menos um canal deve ser selecionado',
  }),
});

export const createSurveySchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Título deve ter pelo menos 1 caractere',
    'string.max': 'Título deve ter no máximo 200 caracteres',
    'any.required': 'Título é obrigatório',
  }),
  description: Joi.string().max(1000).optional().messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),
  questions: Joi.array().items(questionSchema).min(1).required().messages({
    'array.min': 'Pelo menos uma pergunta é obrigatória',
    'any.required': 'Perguntas são obrigatórias',
  }),
  settings: settingsSchema.optional(),
});

export const updateSurveySchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  questions: Joi.array().items(questionSchema).min(1).optional(),
  settings: settingsSchema.optional(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED').optional(),
});

export const sendSurveySchema = Joi.object({
  recipients: Joi.array().items(
    Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
      }),
      name: Joi.string().min(1).max(100).optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
        'string.pattern.base': 'Telefone deve ter um formato válido',
      }),
    })
  ).min(1).required().messages({
    'array.min': 'Pelo menos um destinatário é obrigatório',
    'any.required': 'Destinatários são obrigatórios',
  }),
  channel: Joi.string().valid('email', 'whatsapp').default('email'),
  scheduledAt: Joi.date().iso().optional(),
});

export async function validateCreateSurvey(data: any) {
  const { error, value } = createSurveySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(`Validation error: ${errorMessages.join(', ')}`);
  }

  return value;
}

export async function validateUpdateSurvey(data: any) {
  const { error, value } = updateSurveySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(`Validation error: ${errorMessages.join(', ')}`);
  }

  return value;
}

export async function validateSendSurvey(data: any) {
  const { error, value } = sendSurveySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(`Validation error: ${errorMessages.join(', ')}`);
  }

  return value;
}
