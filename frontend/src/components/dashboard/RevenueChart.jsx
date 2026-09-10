import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-1">
          {data.month} {data.year}
        </p>
        <p className="text-sm font-bold text-emerald-700">
          ₹{data.revenue.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {data.count} payment{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await api.get('/users/revenue-chart');
      if (response.data.success) {
        setData(response.data.data);
        const sum = response.data.data.reduce((acc, item) => acc + item.revenue, 0);
        setTotal(sum);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
        <div className="flex items-center justify-center h-full min-h-[420px]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
            <CurrencyRupeeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Revenue Overview</h3>
            <p className="text-xs text-gray-500">Last 6 months</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
          <p className="text-lg font-bold text-emerald-700">
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
            <Bar
              dataKey="revenue"
              fill="url(#greenGradient)"
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
            />
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Empty state */}
      {data.every(d => d.revenue === 0) && (
        <div className="text-center py-2 text-xs text-gray-400">
          No revenue data available yet
        </div>
      )}
    </div>
  );
};

export default RevenueChart;