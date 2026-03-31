const Joi = require('joi');

/**
 * Order Service Validation Schemas
 */

const createOrderSchema = Joi.object({
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required',
    'string.empty': 'Customer ID cannot be empty'
  }),
  vendorId: Joi.string().required().messages({
    'any.required': 'Vendor ID is required'
  }),
  items: Joi.array()
    .items(
      Joi.object({
        menuItemId: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Order must contain at least one item'
    }),
  totalAmount: Joi.number().positive().required().messages({
    'number.positive': 'Total amount must be positive',
    'any.required': 'Total amount is required'
  }),
  deliveryAddress: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    address: Joi.string().required()
  }).required(),
  paymentMethod: Joi.string()
    .valid('cod', 'stripe', 'khalti', 'esewa')
    .required()
    .messages({
      'any.only': 'Invalid payment method. Allowed: cod, stripe, khalti, esewa'
    })
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': 'Invalid order status'
    })
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().optional().max(500)
});

const validateCreateOrder = (data) => {
  return createOrderSchema.validate(data, { abortEarly: false });
};

const validateUpdateOrderStatus = (data) => {
  return updateOrderStatusSchema.validate(data, { abortEarly: false });
};

const validateCancelOrder = (data) => {
  return cancelOrderSchema.validate(data, { abortEarly: false });
};

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCancelOrder
};
