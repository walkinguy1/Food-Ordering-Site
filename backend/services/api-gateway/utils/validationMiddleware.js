const Joi = require('joi');

/**
 * Middleware for request validation
 */

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

module.exports = {
  validateRequest
};
