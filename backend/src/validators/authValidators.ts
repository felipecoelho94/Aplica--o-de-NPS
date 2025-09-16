import Joi from 'joi';
import { SignupData, LoginData } from '../services/authService';

const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Email deve ter um formato válido',
  'any.required': 'Email é obrigatório',
});

const passwordSchema = Joi.string().min(8).required().messages({
  'string.min': 'Senha deve ter pelo menos 8 caracteres',
  'any.required': 'Senha é obrigatória',
});

const nameSchema = Joi.string().min(2).max(100).required().messages({
  'string.min': 'Nome deve ter pelo menos 2 caracteres',
  'string.max': 'Nome deve ter no máximo 100 caracteres',
  'any.required': 'Nome é obrigatório',
});

const tenantNameSchema = Joi.string().min(2).max(100).optional().messages({
  'string.min': 'Nome da empresa deve ter pelo menos 2 caracteres',
  'string.max': 'Nome da empresa deve ter no máximo 100 caracteres',
});

export const signupSchema = Joi.object<SignupData>({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  tenantName: tenantNameSchema,
});

export const loginSchema = Joi.object<LoginData>({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória',
  }),
});

export async function validateSignup(data: any): Promise<SignupData> {
  const { error, value } = signupSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(`Validation error: ${errorMessages.join(', ')}`);
  }

  return value;
}

export async function validateLogin(data: any): Promise<LoginData> {
  const { error, value } = loginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new Error(`Validation error: ${errorMessages.join(', ')}`);
  }

  return value;
}
