/* eslint-disable no-unused-vars */
import React from 'react';
import { Card, CardBody } from './Card';
import './Analytics.css';

/**
 * StatCard - Display a single metric
 */
export const StatCard = ({
  label,
  value,
  change = 0,
  icon: Icon = null,
  trend = 'up',
}) => (
  <Card compact className="stat-card">
    {Icon && <div className="stat-icon">{Icon}</div>}
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {change !== 0 && (
        <p className={`stat-change stat-${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      )}
    </div>
  </Card>
);

/**
 * AnalyticsChart - Simple bar/line chart visualization
 */
export const AnalyticsChart = ({
  title,
  data = [],
  type = 'bar',
  height = 300,
  showLegend = true,
}) => {
  if (!data.length) {
    return (
      <Card>
        <h3>{title}</h3>
        <p className="text-muted">No data available</p>
      </Card>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value || 0));
  const scale = (height - 40) / maxValue;

  return (
    <Card>
      <h3 className="chart-title">{title}</h3>
      <div className="chart-container" style={{ height: `${height}px` }}>
        {type === 'bar' ? (
          <div className="bar-chart">
            {data.map((item, i) => (
              <div key={i} className="bar-group">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      height: `${(item.value / maxValue) * 100}%`,
                    }}
                  >
                    <span className="bar-value">{item.value}</span>
                  </div>
                </div>
                <label className="bar-label">{item.label}</label>
              </div>
            ))}
          </div>
        ) : (
          <div className="line-chart">
            {/* Simple line visualization */}
            {data.map((item, i) => (
              <div key={i} className="line-point" style={{ left: `${(i / data.length) * 100}%` }}>
                <span className="point-label">{item.label}</span>
                <span className="point-value">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {showLegend && (
        <div className="chart-legend">
          {data.slice(0, 3).map((item, i) => (
            <span key={i} className="legend-item">
              <span className="legend-color"></span>
              {item.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * RevenueChart - Revenue trends visualization
 */
export const RevenueChart = ({ data = [] }) => {
  const chartData = data.map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.revenue,
  }));

  return <AnalyticsChart title="Revenue Trends" data={chartData} type="bar" />;
};

/**
 * OrderStats - Quick statistics about orders
 */
export const OrderStats = ({ stats = {} }) => (
  <div className="grid grid-3">
    <StatCard
      label="Total Orders"
      value={stats.totalOrders || 0}
      change={stats.orderChange || 0}
      trend={stats.orderTrend || 'up'}
      icon="📦"
    />
    <StatCard
      label="Completed"
      value={stats.completedOrders || 0}
      change={stats.completionChange || 0}
      trend="up"
      icon="✅"
    />
    <StatCard
      label="Avg Order Value"
      value={`$${stats.avgOrderValue?.toFixed(2) || '0.00'}`}
      change={stats.valueChange || 0}
      trend={stats.valueTrend || 'up'}
      icon="💰"
    />
  </div>
);

/**
 * VendorRanking - Top vendors by performance
 */
export const VendorRanking = ({ vendors = [] }) => (
  <Card>
    <h3>Top Vendors</h3>
    <div className="ranking-list">
      {vendors.map((vendor, i) => (
        <div key={i} className="ranking-item">
          <span className="ranking-position">#{i + 1}</span>
          <div className="ranking-info">
            <h4>{vendor.name}</h4>
            <p className="text-sm text-muted">{vendor.orders} orders</p>
          </div>
          <div className="ranking-stats">
            <span className="rating">⭐ {vendor.rating?.toFixed(1)}</span>
            <span className="revenue">${vendor.revenue?.toFixed(0)}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/**
 * PaymentMethodBreakdown - Payment method distribution
 */
export const PaymentBreakdown = ({ methods = {} }) => {
  const total = Object.values(methods).reduce((a, b) => a + (b.count || 0), 0);

  return (
    <Card>
      <h3>Payment Methods</h3>
      <div className="payment-breakdown">
        {Object.entries(methods).map(([method, data]) => (
          <div key={method} className="payment-item">
            <div className="payment-header">
              <span className="payment-method">{method}</span>
              <span className="payment-count">{data.count} transactions</span>
            </div>
            <div className="payment-bar">
              <div
                className="payment-fill"
                style={{
                  width: `${(data.count / total) * 100}%`,
                }}
              >
                {(data.count / total) * 100 > 10 && (
                  <span className="payment-percent">
                    {Math.round((data.count / total) * 100)}%
                  </span>
                )}
              </div>
            </div>
            <p className="payment-amount">${data.amount?.toFixed(0)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * CompleteAnalyticsDashboard - Full dashboard view
 */
export const AnalyticsDashboard = ({ data = {} }) => (
  <div className="analytics-dashboard">
    <div className="section-title">Analytics Dashboard</div>

    <OrderStats stats={data.orderStats} />

    <div className="grid grid-2">
      <RevenueChart data={data.revenueData} />
      <PaymentBreakdown methods={data.paymentMethods} />
    </div>

    <VendorRanking vendors={data.topVendors} />
  </div>
);
