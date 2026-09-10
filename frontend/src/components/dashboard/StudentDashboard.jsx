import React from 'react';
import { BookOpenIcon, CreditCardIcon, ClockIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <div className="group card-stats">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const StudentDashboard = ({ stats }) => {
  const cards = [
    {
      title: 'Enrolled Batches',
      value: stats?.enrolledBatches || 0,
      icon: BookOpenIcon,
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-500'
    },
    {
      title: 'Paid Batches',
      value: stats?.paidBatches || 0,
      icon: CreditCardIcon,
      gradient: 'bg-gradient-to-br from-emerald-600 to-teal-600'
    },
    {
      title: 'Pending Batches',
      value: stats?.pendingBatches || 0,
      icon: ClockIcon,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500'
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="mt-6 card-gradient">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
              <p className="text-xs text-gray-500">Get started with these actions</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/batches" 
              className="btn-primary flex items-center"
            >
              <BookOpenIcon className="w-4 h-4 mr-2" />
              View Batches
            </Link>
            <Link 
              to="/payments" 
              className="btn-success flex items-center"
            >
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Pay Fees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;