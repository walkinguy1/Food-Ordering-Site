const Joi = require('joi');

/**
 * Payment Service Validation Schemas
 */

const initiatePaymentSchema = Joi.object({
  orderId: Joi.string().required().messages({
    'any.required': 'Order ID is required'
  }),
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required'
  }),
  vendorId: Joi.string().required().messages({
    'any.required': 'Vendor ID is required'
  }),
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'any.required': 'Amount is required'
    }),
  paymentMethod: Joi.string()
    .valid('stripe', 'khalti', 'esewa', 'cod')
    .required()
    .messages({
      'any.only': 'Invalid payment method. Allowed: stripe, khalti, esewa, cod'
    })
});

const verifyStripePaymentSchema = Joi.object({
  paymentIntentId: Joi.string().pattern(/^pi_/).required().messages({
    'any.required': 'Payment Intent ID is required',
    'string.pattern.base': 'Invalid Stripe Payment Intent ID format'
  })
});

const refundPaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional()
});

const validateInitiatePayment = (data) => {
  return initiatePaymentSchema.validate(data, { abortEarly: false });
};

const validateVerifyStripePayment = (data) => {
  return verifyStripePaymentSchema.validate(data, { abortEarly: false });
};

const validateRefundPayment = (data) => {
  return refundPaymentSchema.validate(data, { abortEarly: false });
};

module.exports = {
  initiatePaymentSchema,
  verifyStripePaymentSchema,
  refundPaymentSchema,
  validateInitiatePayment,
  validateVerifyStripePayment,
  validateRefundPayment
};
