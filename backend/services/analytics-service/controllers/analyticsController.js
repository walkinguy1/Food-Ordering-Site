const OrderMetric = require('../models/OrderMetric');
const PaymentMetric = require('../models/PaymentMetric');
const DailyMetric = require('../models/DailyMetric');

// @desc    Get overall dashboard metrics
// @route   GET /api/v1/analytics/dashboard
// @access  Private Admin
const getDashboard = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get metrics for the specified period
    const orders = await OrderMetric.find({ createdAt: { $gte: startDate } });
    const payments = await PaymentMetric.find({ initiatedAt: { $gte: startDate } });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'completed').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;
    const uniqueVendors = new Set(orders.map(o => o.vendorId)).size;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgOrderDuration = totalOrders > 0
      ? orders.reduce((sum, o) => sum + (o.totalDuration || 0), 0) / totalOrders
      : 0;

    res.json({
      success: true,
      period: { days, startDate },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        successRate: paymentSuccessRate
      },
      revenue: {
        total: totalRevenue,
        average: avgOrderValue
      },
      users: {
        activeCustomers: uniqueCustomers,
        activeVendors: uniqueVendors
      },
      performance: {
        avgOrderDuration: Math.round(avgOrderDuration),
        avgOrderValue: Math.round(avgOrderValue * 100) / 100
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get revenue metrics
// @route   GET /api/v1/analytics/revenue
// @access  Private Admin
const getRevenueMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await OrderMetric.find({ createdAt: { $gte: startDate } });

    // Group by date
    const revenueByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = { orders: 0, revenue: 0 };
      }
      revenueByDate[date].orders++;
      revenueByDate[date].revenue += order.amount;
    });

    const chartData = Object.entries(revenueByDate).map(([date, data]) => ({
      date,
      orders: data.orders,
      revenue: data.revenue
    }));

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const avgDailyRevenue = Math.round((totalRevenue / days) * 100) / 100;

    res.json({
      success: true,
      summary: {
        totalRevenue,
        avgDailyRevenue,
        period: days
      },
      chartData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get vendor metrics
// @route   GET /api/v1/analytics/vendors
// @access  Private Admin
const getVendorMetrics = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await OrderMetric.find({ createdAt: { $gte: startDate } });

    // Group by vendor
    const vendorMetrics = {};
    orders.forEach(order => {
      if (!vendorMetrics[order.vendorId]) {
        vendorMetrics[order.vendorId] = {
          vendorId: order.vendorId,
          totalOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        };
      }
      vendorMetrics[order.vendorId].totalOrders++;
      if (order.status === 'delivered') {
        vendorMetrics[order.vendorId].completedOrders++;
      }
      vendorMetrics[order.vendorId].totalRevenue += order.amount;
    });

    // Calculate averages and sort
    const vendors = Object.values(vendorMetrics)
      .map(v => ({
        ...v,
        avgOrderValue: v.totalOrders > 0 ? v.totalRevenue / v.totalOrders : 0,
        completionRate: v.totalOrders > 0 ? (v.completedOrders / v.totalOrders) * 100 : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    res.json({
      success: true,
      period: days,
      vendors
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get payment method breakdown
// @route   GET /api/v1/analytics/payments
// @access  Private Admin
const getPaymentAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await PaymentMetric.find({ initiatedAt: { $gte: startDate } });

    const breakdown = {
      stripe: { count: 0, amount: 0, successRate: 0 },
      khalti: { count: 0, amount: 0, successRate: 0 },
      esewa: { count: 0, amount: 0, successRate: 0 },
      cod: { count: 0, amount: 0, successRate: 0 }
    };

    payments.forEach(payment => {
      const method = payment.paymentMethod;
      breakdown[method].count++;
      breakdown[method].amount += payment.amount;

      if (payment.status === 'completed') {
        breakdown[method].successRate++;
      }
    });

    // Calculate success rates
    Object.keys(breakdown).forEach(method => {
      if (breakdown[method].count > 0) {
        breakdown[method].successRate = (breakdown[method].successRate / breakdown[method].count) * 100;
      }
    });

    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'completed').length;
    const overallSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    res.json({
      success: true,
      period: days,
      summary: {
        total: totalPayments,
        successful: successfulPayments,
        successRate: overallSuccessRate
      },
      breakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get order status distribution
// @route   GET /api/v1/analytics/orders/status
// @access  Private Admin
const getOrderStatusDistribution = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await OrderMetric.find({ createdAt: { $gte: startDate } });

    const statusDistribution = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      if (statusDistribution.hasOwnProperty(order.status)) {
        statusDistribution[order.status]++;
      }
    });

    const chartData = Object.entries(statusDistribution).map(([status, count]) => ({
      status,
      count,
      percentage: orders.length > 0 ? (count / orders.length) * 100 : 0
    }));

    res.json({
      success: true,
      period: days,
      totalOrders: orders.length,
      distribution: chartData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboard,
  getRevenueMetrics,
  getVendorMetrics,
  getPaymentAnalytics,
  getOrderStatusDistribution
};
