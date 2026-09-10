import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import api from '../api/axios';
import { SparklesIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/users/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard stats={stats} />;
      case 'teacher':
        return <TeacherDashboard stats={stats} />;
      case 'student':
        return <StudentDashboard stats={stats} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <Layout>
      {/* ✅ NO max-w-7xl mx-auto - content starts from left */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 flex items-center">
              <SparklesIcon className="w-4 h-4 text-emerald-500 mr-1.5" />
              Welcome back, {user?.name}!
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
        {renderDashboard()}
      </div>
    </Layout>
  );
};

export default DashboardPage;