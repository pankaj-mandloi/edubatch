import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import PaymentHistory from '../components/payments/PaymentHistory';
import PaymentButton from '../components/payments/PaymentButton';
import api from '../api/axios';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, statusFilter, payments]);

  const fetchData = async () => {
    try {
      const paymentsRes = await api.get('/payments/history');
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.data);
      }

      if (user?.role === 'student') {
        const enrollmentsRes = await api.get('/enrollments/my');
        if (enrollmentsRes.data.success) {
          const pending = enrollmentsRes.data.data.filter(
            e => e.paymentStatus === 'pending' && e.isActive
          );
          setPendingEnrollments(pending);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.enrollment?.batch?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  // Statistics
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'created').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalRevenue: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isStudent ? 'My Payments' : 'Payments'}
            </h1>
            <p className="text-sm text-gray-500">
              {isStudent
                ? 'Complete pending payments and view history'
                : 'Track all payment transactions'}
            </p>
          </div>
        </div>

        {/* Pending Payments - For Students */}
        {isStudent && pendingEnrollments.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Pending Payments ({pendingEnrollments.length})
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Complete these payments to activate your enrollment
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingEnrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-amber-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {enrollment.batch?.name || 'Unknown Batch'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {enrollment.batch?.subject || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-semibold text-gray-800">
                      ₹{enrollment.batch?.fee?.toLocaleString('en-IN') || 0}
                    </p>
                    <PaymentButton
                      enrollmentId={enrollment._id}
                      onSuccess={() => {
                        fetchData();
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards - For Admin/Teacher */}
        {!isStudent && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </p>
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <CurrencyRupeeIcon className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Paid
                </p>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-emerald-700">{stats.paid}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                  Pending
                </p>
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-amber-700">{stats.pending}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </p>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isStudent ? 'Search by batch name or payment ID...' : 'Search by student, batch, or payment ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
              />
            </div>

            <div className="relative">
              <FunnelIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="created">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredPayments.length} of {payments.length} payments</span>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Payment History */}
        <PaymentHistory payments={filteredPayments} userRole={user?.role} />
      </div>
    </Layout>
  );
};

export default PaymentsPage;