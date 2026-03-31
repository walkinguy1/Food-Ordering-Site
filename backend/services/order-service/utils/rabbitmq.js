const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672');
    channel = await conn.createChannel();
    await channel.assertExchange('food_app_events', 'topic', { durable: true });
    console.log('Connected to RabbitMQ (Order Service)');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
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

module.exports = { connectRabbitMQ, publishEvent };
