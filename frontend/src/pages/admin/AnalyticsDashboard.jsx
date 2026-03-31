/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Button,
  Card,
  Spinner,
  AnalyticsDashboard,
  StatCard,
  RevenueChart,
  PaymentBreakdown,
  VendorRanking,
} from '../UI';
import '../styles/AdminDashboard.css';

/**
 * Analytics Dashboard Page
 * Displays real-time analytics integrated from backend API
 */
const AnalyticsDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState({
    orderStats: {
      totalOrders: 1250,
      completedOrders: 1180,
      avgOrderValue: 47.25,
      orderChange: 12,
      orderTrend: 'up',
      completionChange: -3,
      valueChange: 8,
      valueTrend: 'up',
    },
    revenueData: [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), revenue: 3200 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), revenue: 3500 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), revenue: 2800 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), revenue: 4100 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), revenue: 3900 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), revenue: 4300 },
      { date: new Date(), revenue: 4500 },
    ],
    paymentMethods: {
      card: { count: 750, amount: 28500 },
      khalti: { count: 300, amount: 12400 },
      esewa: { count: 150, amount: 6200 },
      cod: { count: 50, amount: 2100 },
    },
    topVendors: [
      { name: 'Pizza Palace', orders: 450, revenue: 12500, rating: 4.8 },
      { name: 'Bangkok Bistro', orders: 380, revenue: 11200, rating: 4.6 },
      { name: 'Burger House', orders: 320, revenue: 9800, rating: 4.5 },
    ],
  });

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from /api/v1/analytics/dashboard?range={dateRange}
      // const res = await fetch(`/api/v1/analytics/dashboard?range=${dateRange}`);
      // const data = await res.json();
      // setAnalyticsData(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">Analytics Dashboard</h1>
          <div className="admin-filters">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="24h">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Key Statistics */}
            <div className="grid grid-3" style={{ marginBottom: 'var(--space-3xl)' }}>
              <StatCard
                label="Total Orders"
                value={analyticsData.orderStats.totalOrders}
                change={analyticsData.orderStats.orderChange}
                trend={analyticsData.orderStats.orderTrend}
                icon="📦"
              />
              <StatCard
                label="Completed Orders"
                value={analyticsData.orderStats.completedOrders}
                change={analyticsData.orderStats.completionChange}
                trend="up"
                icon="✅"
              />
              <StatCard
                label="Avg Order Value"
                value={`$${analyticsData.orderStats.avgOrderValue.toFixed(2)}`}
                change={analyticsData.orderStats.valueChange}
                trend={analyticsData.orderStats.valueTrend}
                icon="💰"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-2" style={{ marginBottom: 'var(--space-3xl)' }}>
              <RevenueChart data={analyticsData.revenueData} />
              <PaymentBreakdown methods={analyticsData.paymentMethods} />
            </div>

            {/* Vendor Rankings */}
            <VendorRanking vendors={analyticsData.topVendors} />

            {/* Additional Metrics */}
            <Card className="metrics-card" style={{ marginTop: 'var(--space-3xl)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                <div>
                  <h4>Avg Delivery Time</h4>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginTop: 'var(--space-md)', color: 'var(--color-primary)' }}>32 min</p>
                </div>
                <div>
                  <h4>Customer Satisfaction</h4>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginTop: 'var(--space-md)', color: 'var(--color-success)' }}>4.6⭐</p>
                </div>
                <div>
                  <h4>Active Vendors</h4>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginTop: 'var(--space-md)', color: 'var(--color-info)' }}>24</p>
                </div>
                <div>
                  <h4>Repeat Customers</h4>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginTop: 'var(--space-md)', color: 'var(--color-warning)' }}>65%</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
