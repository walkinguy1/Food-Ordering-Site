const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672');
    channel = await connection.createChannel();
    
    // Assert exchange
    await channel.assertExchange('food_app_events', 'topic', { durable: true });
    
    // Setup queues for recommendation-related events
    const eventTypes = [
      { queue: 'recommend_order_events', routingKey: 'order.created' },
      { queue: 'recommend_interaction_events', routingKey: 'menu.viewed' }
    ];

    for (const event of eventTypes) {
      await channel.assertQueue(event.queue, { durable: true });
      await channel.bindQueue(event.queue, 'food_app_events', event.routingKey);
    }
    
    console.log('Connected to RabbitMQ (Recommendation Service)');
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
    channel.consume('recommend_order_events', async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Recommendation Service received order event:', event.orderId);
        await callback(event);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error consuming order events:', err);
  }
};

const consumeInteractionEvents = async (callback) => {
  if (!channel) {
    console.error('RabbitMQ channel not established');
    return;
  }

  try {
    channel.consume('recommend_interaction_events', async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Recommendation Service received interaction event:', event.type);
        await callback(event);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error consuming interaction events:', err);
  }
};

module.exports = {
  connectRabbitMQ,
  consumeOrderEvents,
  consumeInteractionEvents
};
