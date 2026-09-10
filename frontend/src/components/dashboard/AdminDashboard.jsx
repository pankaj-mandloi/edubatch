import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, gradient, trend }) => (
  <div className="group card-stats">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, label, description }) => (
  <Link
    to={to}
    className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
        {label}
      </p>
      <p className="text-xs text-gray-500 truncate">{description}</p>
    </div>
    <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
  </Link>
);

const AdminDashboard = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: UsersIcon,
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-500'
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: AcademicCapIcon,
      gradient: 'bg-gradient-to-br from-emerald-600 to-teal-600'
    },
    {
      title: 'Active Batches',
      value: stats?.activeBatches || 0,
      icon: BookOpenIcon,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: CurrencyRupeeIcon,
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-600'
    },
    {
      title: 'Total Batches',
      value: stats?.totalBatches || 0,
      icon: ClockIcon,
      gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600'
    },
    {
      title: 'Pending Fees',
      value: stats?.pendingFees || 0,
      icon: UserGroupIcon,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500'
    }
  ];

  const quickActions = [
    {
      to: '/batches',
      icon: PlusIcon,
      label: 'Create Batch',
      description: 'Add a new batch'
    },
    {
      to: '/enrollments',
      icon: UserGroupIcon,
      label: 'Enroll Student',
      description: 'Add student to batch'
    },
    {
      to: '/notices',
      icon: SparklesIcon,
      label: 'Post Notice',
      description: 'Share announcement'
    },
    {
      to: '/payments',
      icon: CurrencyRupeeIcon,
      label: 'View Payments',
      description: 'Track transactions'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card-gradient">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Quick Actions</h3>
            <p className="text-xs text-gray-500">Common tasks at your fingertips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;