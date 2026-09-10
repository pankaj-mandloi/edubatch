import React, { useState } from 'react';
import { XMarkIcon, GlobeAltIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const NoticeForm = ({ notice, batches, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: notice?.title || '',
    body: notice?.body || '',
    batchId: notice?.batch?._id || notice?.batch || '',
    pinned: notice?.pinned || false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.title || data.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (data.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!data.body || data.body.trim().length < 5) {
      newErrors.body = 'Notice body must be at least 5 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      const { [name]: removed, ...rest } = errors;
      setErrors(rest);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const allErrors = validateForm(formData);
  setErrors(allErrors);

  if (Object.keys(allErrors).length > 0) {
    return;
  }

  setLoading(true);
  const loadingToast = toast.loading(notice ? 'Updating notice...' : 'Publishing notice...');

  try {
    const url = notice ? `/notices/${notice._id}` : '/notices';
    const method = notice ? 'put' : 'post';

    const payload = {
      ...formData,
      batchId: formData.batchId === '' ? null : formData.batchId
    };

    const response = await api[method](url, payload);

    if (response.data.success) {
      toast.success(
        notice ? 'Notice updated successfully!' : 'Notice published successfully!',
        { id: loadingToast }
      );
      onSuccess();
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Failed to save notice',
      { id: loadingToast }
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {notice ? 'Edit Notice' : 'Create New Notice'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {notice ? 'Update notice details' : 'Share an announcement with your students'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notice Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength="100"
              className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                errors.title
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
              placeholder="e.g. Fee payment deadline reminder"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title}</p>
              ) : (
                <p className="text-xs text-gray-400">Keep it short and clear</p>
              )}
              <p className="text-xs text-gray-400">{formData.title.length}/100</p>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notice Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows="6"
              className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm resize-none ${
                errors.body
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
              }`}
              placeholder="Write your announcement here... Be clear and concise."
            />
            {errors.body ? (
              <p className="mt-1 text-xs text-red-500">{errors.body}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">{formData.body.length} characters</p>
            )}
          </div>

          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, batchId: '' }))}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                  !formData.batchId
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  !formData.batchId ? 'bg-emerald-500' : 'bg-blue-50'
                }`}>
                  <GlobeAltIcon className={`w-4 h-4 ${
                    !formData.batchId ? 'text-white' : 'text-blue-600'
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${
                    !formData.batchId ? 'text-emerald-700' : 'text-gray-700'
                  }`}>
                    Global Notice
                  </p>
                  <p className="text-xs text-gray-500">All users</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (batches.length > 0 && !formData.batchId) {
                    setFormData(prev => ({ ...prev, batchId: batches[0]._id }));
                  }
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                  formData.batchId
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  formData.batchId ? 'bg-emerald-500' : 'bg-emerald-50'
                }`}>
                  <AcademicCapIcon className={`w-4 h-4 ${
                    formData.batchId ? 'text-white' : 'text-emerald-600'
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${
                    formData.batchId ? 'text-emerald-700' : 'text-gray-700'
                  }`}>
                    Specific Batch
                  </p>
                  <p className="text-xs text-gray-500">Enrolled students</p>
                </div>
              </button>
            </div>

            {/* Batch dropdown - only show if specific batch selected */}
            {formData.batchId && (
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
              >
                <option value="">Select a batch...</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} — {batch.subject}
                  </option>
                ))}
              </select>
            )}
            {!formData.batchId && (
              <p className="text-xs text-gray-400">
                This notice will be visible to all users on the platform.
              </p>
            )}
          </div>

          {/* Pinned */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/60">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="pinned"
                checked={formData.pinned}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Pin this notice</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pinned notices appear at the top and are highlighted in green.
                </p>
              </div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (notice ? 'Update Notice' : 'Publish Notice')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeForm;