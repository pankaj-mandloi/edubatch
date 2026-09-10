import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import NoticeList from '../components/notices/NoticeList';
import NoticeForm from '../components/notices/NoticeForm';
import ConfirmModal from '../components/common/ConfirmModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const NoticesPage = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [batches, setBatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    noticeId: null,
    noticeTitle: ''
  });

  useEffect(() => {
    fetchNotices();
    if (user?.role === 'admin' || user?.role === 'teacher') {
      fetchBatches();
    }
  }, []);

  useEffect(() => {
    filterNotices();
  }, [searchQuery, batchFilter, notices]);

  const fetchNotices = async () => {
    try {
      const response = await api.get('/notices');
      if (response.data.success) {
        setNotices(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const filterNotices = () => {
    let filtered = [...notices];

    if (searchQuery) {
      filtered = filtered.filter(notice =>
        notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (batchFilter !== 'all') {
      if (batchFilter === 'global') {
        filtered = filtered.filter(notice => !notice.batch);
      } else {
        filtered = filtered.filter(notice => notice.batch?._id === batchFilter);
      }
    }

    setFilteredNotices(filtered);
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setShowForm(true);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleDeleteClick = (notice) => {
    setConfirmModal({
      isOpen: true,
      noticeId: notice._id,
      noticeTitle: notice.title
    });
  };

  const handleConfirmDelete = async () => {
    const { noticeId } = confirmModal;
    const loadingToast = toast.loading('Deleting notice...');

    try {
      const response = await api.delete(`/notices/${noticeId}`);
      if (response.data.success) {
        toast.success('Notice deleted successfully!', { id: loadingToast });
        fetchNotices();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete notice',
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

  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notices</h1>
            <p className="text-sm text-gray-500">
              {canManage
                ? 'Create and manage batch announcements'
                : 'View announcements from your batches'}
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleCreate}
              className="btn-primary flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Notice
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notices by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
              />
            </div>

            <div className="relative">
              <FunnelIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="all">All Notices</option>
                <option value="global">Global Only</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredNotices.length} of {notices.length} notices</span>
            {(searchQuery || batchFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBatchFilter('all');
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Notice List */}
        <NoticeList
          notices={filteredNotices}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          canManage={canManage}
          userRole={user?.role}
          currentUserId={user?._id}
        />

        {/* Form Modal */}
        {showForm && (
          <NoticeForm
            notice={editingNotice}
            batches={batches}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchNotices();
            }}
          />
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, noticeId: null, noticeTitle: '' })}
          onConfirm={handleConfirmDelete}
          title="Delete Notice?"
          message={`Are you sure you want to delete "${confirmModal.noticeTitle}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default NoticesPage;