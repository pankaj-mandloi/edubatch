import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import EnrollmentList from '../components/enrollments/EnrollmentList';
import EnrollmentForm from '../components/enrollments/EnrollmentForm';
import ConfirmModal from '../components/common/ConfirmModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const EnrollmentsPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    enrollmentId: null,
    studentName: '',
    batchName: ''
  });

  useEffect(() => {
    fetchEnrollments();
    if (user?.role === 'admin') {
      fetchStudents();
      fetchBatches();
    }
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [searchQuery, statusFilter, enrollments]);

  const fetchEnrollments = async () => {
    try {
      const url = user?.role === 'student' ? '/enrollments/my' : '/enrollments';
      const response = await api.get(url);
      if (response.data.success) {
        setEnrollments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users?role=student');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches?status=active');
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const filterEnrollments = () => {
    let filtered = [...enrollments];

    if (searchQuery) {
      filtered = filtered.filter(enrollment =>
        enrollment.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.batch?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.paymentStatus === statusFilter);
    }

    setFilteredEnrollments(filtered);
  };

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleDeleteClick = (enrollment) => {
    setConfirmModal({
      isOpen: true,
      enrollmentId: enrollment._id,
      studentName: enrollment.student?.name || 'this student',
      batchName: enrollment.batch?.name || 'this batch'
    });
  };

  const handleConfirmDelete = async () => {
    const { enrollmentId } = confirmModal;
    const loadingToast = toast.loading('Removing enrollment...');

    try {
      const response = await api.delete(`/enrollments/${enrollmentId}`);
      if (response.data.success) {
        toast.success('Enrollment removed successfully!', { id: loadingToast });
        fetchEnrollments();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to remove enrollment',
        { id: loadingToast }
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isStudent ? 'My Enrollments' : 'Enrollments'}
            </h1>
            <p className="text-sm text-gray-500">
              {isStudent
                ? 'View your enrolled batches and payment status'
                : 'Manage student enrollments across batches'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateClick}
              className="btn-primary flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Enrollment
            </button>
          )}
        </div>

        {/* Filters */}
        {!isStudent && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, email, or batch..."
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
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="waived">Waived</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredEnrollments.length} of {enrollments.length} enrollments</span>
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
        )}

        {/* Enrollment List */}
        <EnrollmentList
          enrollments={filteredEnrollments}
          onDelete={handleDeleteClick}
          userRole={user?.role}
          onRefresh={fetchEnrollments}
        />

        {/* Form Modal */}
        {showForm && (
          <EnrollmentForm
            students={students}
            batches={batches}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchEnrollments();
            }}
          />
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, enrollmentId: null, studentName: '', batchName: '' })}
          onConfirm={handleConfirmDelete}
          title="Remove Enrollment?"
          message={`Are you sure you want to remove ${confirmModal.studentName} from "${confirmModal.batchName}"? This action cannot be undone.`}
          confirmText="Yes, Remove"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default EnrollmentsPage;