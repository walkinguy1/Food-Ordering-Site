const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672');
    channel = await connection.createChannel();
    
    // Assert exchange
    await channel.assertExchange('food_app_events', 'topic', { durable: true });
    
    // Setup queues for different event types
    const eventTypes = [
      { queue: 'analytics_order_events', routingKey: 'order.*' },
      { queue: 'analytics_payment_events', routingKey: 'payment.*' }
    ];

    for (const event of eventTypes) {
      await channel.assertQueue(event.queue, { durable: true });
      await channel.bindQueue(event.queue, 'food_app_events', event.routingKey);
    }
    
    console.log('Connected to RabbitMQ (Analytics Service)');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const consumeOrderEvents = async (callback) => {
  if (!channel) {
    console.error('RabbitMQ channel not established');
    return;
  }

  try {
    channel.consume('analytics_order_events', async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Analytics Service received order event:', event);
        await callback(event);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error consuming order events:', err);
  }
};

const consumePaymentEvents = async (callback) => {
  if (!channel) {
    console.error('RabbitMQ channel not established');
    return;
  }

  try {
    channel.consume('analytics_payment_events', async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Analytics Service received payment event:', event);
        await callback(event);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error consuming payment events:', err);
  }
};

module.exports = {
  connectRabbitMQ,
  consumeOrderEvents,
  consumePaymentEvents
};
