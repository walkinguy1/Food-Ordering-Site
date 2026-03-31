/**
 * Order Saga Pattern Implementation
 * 
 * This module implements the Saga pattern for the Order workflow using RabbitMQ.
 * It handles distributed transactions across multiple services:
 * 1. Order Service - Creates the order
 * 2. Inventory Service - Reserves items
 * 3. Payment Service - Processes the payment
 * 4. Logistics Service - Assigns delivery agent
 * 5. Notification Service - Sends confirmations
 * 
 * The saga uses compensating transactions for rollback.
 */

const amqp = require('amqplib');

class OrderSaga {
  constructor() {
    this.channel = null;
    this.orderId = null;
    this.status = 'not_started';
    this.steps = [];
  }

  /**
   * Initialize RabbitMQ connection
   */
  async init(rabbitmqUrl) {
    try {
      const connection = await amqp.connect(rabbitmqUrl || 'amqp://admin:password@localhost:5672');
      this.channel = await connection.createChannel();
      await this.channel.assertExchange('food_app_events', 'topic', { durable: true });
      console.log('Order Saga initialized');
    } catch (err) {
      console.error('Failed to initialize Order Saga:', err);
      throw err;
    }
  }

  /**
   * LOG: Order saga step status
   */
  logStep(step, action, status, data = {}) {
    const stepLog = {
      timestamp: new Date(),
      orderId: this.orderId,
      step,
      action,
      status,
      data
    };
    this.steps.push(stepLog);
    console.log(`[Order Saga] ${step}: ${action} - ${status}`, data);
  }

  /**
   * Start Order Saga - Main orchestration flow
   */
  async executeOrderSaga(orderData) {
    this.orderId = orderData.orderId;
    this.status = 'in_progress';

    try {
      // Step 1: Create Order (already done, emit event)
      this.logStep('Order Creation', 'emit', 'success', { orderId: this.orderId });
      this.publishEvent('order.created', orderData);

      // Step 2: Wait for inventory reservation
      const inventoryReserved = await this.waitForEvent('inventory.reserved', this.orderId, 30000);
      if (!inventoryReserved) {
        throw new Error('Inventory reservation timeout');
      }
      this.logStep('Inventory', 'reserved', 'success');

      // Step 3: Initiate payment
      const paymentInitiated = await this.initiatePaymentFlow(orderData);
      if (!paymentInitiated) {
        // Compensate: Release inventory
        await this.compensateInventory(orderData);
        throw new Error('Payment initiation failed');
      }
      this.logStep('Payment', 'initiated', 'success');

      // Step 4: Wait for payment completion
      const paymentCompleted = await this.waitForEvent('payment.completed', orderData.orderId, 60000);
      if (!paymentCompleted) {
        // Compensate: Release inventory and cancel payment
        await this.compensateInventory(orderData);
        await this.compensatePayment(orderData);
        throw new Error('Payment failed');
      }
      this.logStep('Payment', 'completed', 'success');

      // Step 5: Update order status to accepted
      this.publishEvent('order.status_updated', {
        orderId: this.orderId,
        ...orderData,
        status: 'accepted',
        previousStatus: 'pending'
      });

      // Step 6: Request delivery assignment
      const deliveryAssigned = await this.assignDelivery(orderData);
      if (!deliveryAssigned) {
        console.warn('Delivery assignment delayed, will retry later');
      }
      this.logStep('Logistics', 'assignment', deliveryAssigned ? 'success' : 'pending');

      this.status = 'completed';
      this.logStep('Saga', 'execution', 'completed', { steps: this.steps.length });

      return {
        success: true,
        orderId: this.orderId,
        status: 'completed',
        steps: this.steps
      };
    } catch (err) {
      this.status = 'failed';
      this.logStep('Saga', 'execution', 'failed', { error: err.message });
      
      // Trigger compensation workflow on critical failure
      await this.compensateOrder(orderData);

      throw err;
    }
  }

  /**
   * Initiate payment flow
   */
  async initiatePaymentFlow(orderData) {
    try {
      this.publishEvent('payment.initiate', {
        orderId: orderData.orderId,
        customerId: orderData.customerId,
        amount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        vendorId: orderData.vendorId
      });
      return true;
    } catch (err) {
      console.error('Payment initiation failed:', err);
      return false;
    }
  }

  /**
   * Assign delivery for the order
   */
  async assignDelivery(orderData) {
    try {
      this.publishEvent('delivery.assign', {
        orderId: orderData.orderId,
        customerId: orderData.customerId,
        vendorId: orderData.vendorId,
        deliveryAddress: orderData.deliveryAddress,
        totalAmount: orderData.totalAmount
      });
      return true;
    } catch (err) {
      console.error('Delivery assignment failed:', err);
      return false;
    }
  }

  /**
   * COMPENSATION: Release inventory if payment fails
   */
  async compensateInventory(orderData) {
    try {
      this.logStep('Compensation', 'inventory_release', 'in_progress');
      this.publishEvent('inventory.release', {
        orderId: orderData.orderId,
        items: orderData.items
      });
      this.logStep('Compensation', 'inventory_release', 'success');
    } catch (err) {
      console.error('Inventory compensation failed:', err);
    }
  }

  /**
   * COMPENSATION: Cancel payment if delivery assignment fails
   */
  async compensatePayment(orderData) {
    try {
      this.logStep('Compensation', 'payment_cancel', 'in_progress');
      this.publishEvent('payment.cancel', {
        orderId: orderData.orderId,
        reason: 'delivery_assignment_failed'
      });
      this.logStep('Compensation', 'payment_cancel', 'success');
    } catch (err) {
      console.error('Payment compensation failed:', err);
    }
  }

  /**
   * COMPENSATION: Full order cancellation
   */
  async compensateOrder(orderData) {
    try {
      this.logStep('Compensation', 'order_cancel', 'in_progress');
      
      // Release inventory
      await this.compensateInventory(orderData);
      
      // Cancel payment
      await this.compensatePayment(orderData);
      
      // Update order status
      this.publishEvent('order.status_updated', {
        orderId: orderData.orderId,
        ...orderData,
        status: 'cancelled',
        previousStatus: 'pending',
        reason: 'saga_execution_failed'
      });

      this.logStep('Compensation', 'order_cancel', 'success');
    } catch (err) {
      console.error('Order compensation failed:', err);
    }
  }

  /**
   * Publish event to RabbitMQ
   */
  publishEvent(routingKey, data) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    this.channel.publish(
      'food_app_events',
      routingKey,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
    console.log(`[Event Published] ${routingKey}:`, data);
  }

  /**
   * Wait for event completion with timeout
   */
  async waitForEvent(eventName, orderId, timeout = 30000) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn(`Event timeout: ${eventName} for order ${orderId}`);
        resolve(false);
      }, timeout);

      // In real implementation, you would subscribe to the event
      // For now, simulate with basic timeout logic
      // This should be replaced with proper event subscription
      resolve(true);
    });
  }

  /**
   * Get saga execution history
   */
  getSagaHistory() {
    return {
      orderId: this.orderId,
      status: this.status,
      steps: this.steps,
      duration: this.getExecutionDuration()
    };
  }

  /**
   * Calculate execution duration
   */
  getExecutionDuration() {
    if (this.steps.length < 2) return 0;
    const firstStep = this.steps[0].timestamp;
    const lastStep = this.steps[this.steps.length - 1].timestamp;
    return lastStep - firstStep;
  }
}

module.exports = OrderSaga;
