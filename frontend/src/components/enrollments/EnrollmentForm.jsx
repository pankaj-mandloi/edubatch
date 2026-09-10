import React, { useState } from 'react';
import { XMarkIcon, UserIcon, AcademicCapIcon, CurrencyRupeeIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EnrollmentForm = ({ students, batches, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    batchId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Selected batch details
  const selectedBatch = batches.find(b => b._id === formData.batchId);

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.studentId) {
      newErrors.studentId = 'Please select a student';
    }

    if (!data.batchId) {
      newErrors.batchId = 'Please select a batch';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
    const loadingToast = toast.loading('Enrolling student...');

    try {
      const response = await api.post('/enrollments', formData);

      if (response.data.success) {
        toast.success('Student enrolled successfully!', { id: loadingToast });
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to enroll student',
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">New Enrollment</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enroll a student into a batch
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
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Student <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm appearance-none cursor-pointer ${
                  errors.studentId
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} — {student.email}
                  </option>
                ))}
              </select>
            </div>
            {errors.studentId && (
              <p className="mt-1 text-xs text-red-500">{errors.studentId}</p>
            )}
            {students.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No students available. Register students first.
              </p>
            )}
          </div>

          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Batch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <AcademicCapIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm appearance-none cursor-pointer ${
                  errors.batchId
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              >
                <option value="">Choose a batch...</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} — {batch.subject} (₹{batch.fee})
                  </option>
                ))}
              </select>
            </div>
            {errors.batchId && (
              <p className="mt-1 text-xs text-red-500">{errors.batchId}</p>
            )}
            {batches.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No active batches available. Create a batch first.
              </p>
            )}
          </div>

          {/* Batch Preview Card */}
          {selectedBatch && (
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/40">
              <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider mb-2">
                Batch Details
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-gray-800">{selectedBatch.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subject</span>
                  <span className="font-medium text-gray-800">{selectedBatch.subject}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <CurrencyRupeeIcon className="w-3.5 h-3.5" />
                    Fee
                  </span>
                  <span className="font-medium text-gray-800">
                    ₹{selectedBatch.fee?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    Capacity
                  </span>
                  <span className="font-medium text-gray-800">
                    {selectedBatch.enrolledCount || 0} / {selectedBatch.capacity}
                  </span>
                </div>
                {(selectedBatch.capacity - (selectedBatch.enrolledCount || 0)) <= 3 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Only {selectedBatch.capacity - (selectedBatch.enrolledCount || 0)} seats left!
                  </p>
                )}
              </div>
            </div>
          )}
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
            disabled={loading || students.length === 0 || batches.length === 0}
            onClick={handleSubmit}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;