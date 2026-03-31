const amqp = require('amqplib');

let channel = null;
let connection = null;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672');
    channel = await connection.createChannel();
    
    // Assert exchange and queue for order events
    await channel.assertExchange('food_app_events', 'topic', { durable: true });
    await channel.assertQueue('payment_service_orders', { durable: true });
    await channel.bindQueue('payment_service_orders', 'food_app_events', 'order.created');
    
    console.log('Connected to RabbitMQ (Payment Service)');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
    setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
  }
};

const publishEvent = (routingKey, data) => {
  if (!channel) {
    console.error('RabbitMQ channel not established');
    return;
  }
  channel.publish('food_app_events', routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
  console.log(`Published event ${routingKey}`);
};

const consumeOrderEvents = async (callback) => {
  if (!channel) {
    console.error('RabbitMQ channel not established');
    return;
  }

  try {
    channel.consume('payment_service_orders', async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Payment Service received event:', event);
        await callback(event);
        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (err) {
    console.error('Error consuming events:', err);
  }
};

module.exports = {
  connectRabbitMQ,
  publishEvent,
  consumeOrderEvents
};
