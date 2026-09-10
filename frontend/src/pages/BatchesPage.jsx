import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import BatchList from '../components/batches/BatchList';
import BatchForm from '../components/batches/BatchForm';
import ConfirmModal from '../components/common/ConfirmModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const BatchesPage = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    batchId: null,
    batchName: ''
  });

  useEffect(() => {
    fetchBatches();
    if (user?.role === 'admin') {
      fetchTeachers();
    }
  }, []);

  useEffect(() => {
    filterBatches();
  }, [searchQuery, statusFilter, batches]);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/users?role=teacher');
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const filterBatches = () => {
    let filtered = [...batches];

    if (searchQuery) {
      filtered = filtered.filter(batch =>
        batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(batch => batch.status === statusFilter);
    }

    setFilteredBatches(filtered);
  };

  const handleCreate = () => {
    setEditingBatch(null);
    setShowForm(true);
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setShowForm(true);
  };

  const handleDeleteClick = (batch) => {
    setConfirmModal({
      isOpen: true,
      batchId: batch._id,
      batchName: batch.name
    });
  };

  const handleConfirmDelete = async () => {
    const { batchId } = confirmModal;
    const loadingToast = toast.loading('Deleting batch...');

    try {
      const response = await api.delete(`/batches/${batchId}`);
      if (response.data.success) {
        toast.success('Batch deleted successfully!', { id: loadingToast });
        fetchBatches();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete batch',
        { id: loadingToast }
      );
    }
  };

  const handleStatusChange = async (id, status) => {
    const loadingToast = toast.loading('Updating status...');
    try {
      const response = await api.patch(`/batches/${id}/status`, { status });
      if (response.data.success) {
        toast.success(`Batch status updated to ${status}`, { id: loadingToast });
        fetchBatches();
      }
    } catch (error) {
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const canCreate = user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Batches</h1>
            <p className="text-sm text-gray-500">
              {user?.role === 'student' 
                ? 'Browse available batches' 
                : 'Manage all your batches'}
            </p>
          </div>
          {canCreate && (
            <button
              onClick={handleCreate}
              className="btn-primary flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Batch
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batches by name or subject..."
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
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredBatches.length} of {batches.length} batches</span>
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

        <BatchList
          batches={filteredBatches}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          userRole={user?.role}
        />

        {showForm && (
          <BatchForm
            batch={editingBatch}
            teachers={teachers}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchBatches();
            }}
          />
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, batchId: null, batchName: '' })}
          onConfirm={handleConfirmDelete}
          title="Delete Batch?"
          message={`Are you sure you want to delete "${confirmModal.batchName}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default BatchesPage;