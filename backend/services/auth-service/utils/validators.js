const Joi = require('joi');

/**
 * Auth Service Validation Schemas
 */

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('customer', 'vendor', 'delivery_agent', 'admin')
    .required()
    .messages({
      'any.only': 'Invalid role. Allowed: customer, vendor, delivery_agent, admin'
    }),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
  vendorName: Joi.string().when('role', {
    is: 'vendor',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
  vendorName: Joi.string().optional(),
  address: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
    })
});

const validateRegister = (data) => {
  return registerSchema.validate(data, { abortEarly: false });
};

const validateLogin = (data) => {
  return loginSchema.validate(data, { abortEarly: false });
};

const validateUpdateProfile = (data) => {
  return updateProfileSchema.validate(data, { abortEarly: false });
};

const validateChangePassword = (data) => {
  return changePasswordSchema.validate(data, { abortEarly: false });
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
};
