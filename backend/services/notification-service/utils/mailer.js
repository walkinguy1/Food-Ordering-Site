const nodemailer = require('nodemailer');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// Email templates
const emailTemplates = {
  orderCreated: (customerName, orderId, totalAmount) => ({
    subject: 'Order Confirmation - Food App',
    html: `
      <h2>Order Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Your order #${orderId} has been successfully placed.</p>
      <p><strong>Total Amount: $${totalAmount.toFixed(2)}</strong></p>
      <p>You will receive updates as your order progresses.</p>
      <p>Thank you for ordering with us!</p>
    `
  }),

  orderAccepted: (customerName, orderId, vendorName) => ({
    subject: 'Order Accepted - Food App',
    html: `
      <h2>Your Order is Being Prepared!</h2>
      <p>Hi ${customerName},</p>
      <p>Your order #${orderId} has been accepted by <strong>${vendorName}</strong>.</p>
      <p>Your food is being prepared and will be ready soon.</p>
    `
  }),

  orderShipped: (customerName, orderId, agentName, estimatedTime) => ({
    subject: 'Order on the Way - Food App',
    html: `
      <h2>Your Order is on the Way!</h2>
      <p>Hi ${customerName},</p>
      <p>Your order #${orderId} is now being delivered by <strong>${agentName}</strong>.</p>
      <p>Estimated delivery time: <strong>${estimatedTime} minutes</strong></p>
      <p>You can track your order in real-time.</p>
    `
  }),

  orderDelivered: (customerName, orderId) => ({
    subject: 'Order Delivered - Food App',
    html: `
      <h2>Order Delivered!</h2>
      <p>Hi ${customerName},</p>
      <p>Your order #${orderId} has been delivered.</p>
      <p>Thank you for your purchase. We hope you enjoy your meal!</p>
      <p>Please rate your experience to help us improve.</p>
    `
  }),

  paymentCompleted: (customerName, orderId, amount) => ({
    subject: 'Payment Confirmed - Food App',
    html: `
      <h2>Payment Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Payment of $${amount.toFixed(2)} for order #${orderId} has been successfully processed.</p>
      <p>Your order will be prepared shortly.</p>
    `
  }),

  paymentFailed: (customerName, orderId, amount) => ({
    subject: 'Payment Failed - Food App',
    html: `
      <h2>Payment Failed</h2>
      <p>Hi ${customerName},</p>
      <p>Your payment of $${amount.toFixed(2)} for order #${orderId} could not be processed.</p>
      <p>Please try again or use a different payment method.</p>
    `
  })
};

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const result = await transporter.sendMail({
      from: `"Food App" <${process.env.SMTP_FROM || 'noreply@foodapp.com'}>`,
      to,
      subject,
      html
    });

    return {
      success: true,
      messageId: result.messageId,
      timestamp: new Date()
    };
  } catch (err) {
    console.error('Email sending error:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
