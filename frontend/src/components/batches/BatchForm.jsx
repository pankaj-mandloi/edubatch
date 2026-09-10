import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BatchForm = ({ batch, teachers, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    subject: batch?.subject || '',
    description: batch?.description || '',
    startDate: batch?.startDate?.split('T')[0] || '',
    endDate: batch?.endDate?.split('T')[0] || '',
    schedule: {
      days: batch?.schedule?.days || [],
      startTime: batch?.schedule?.startTime || '09:00',
      endTime: batch?.schedule?.endTime || '10:00'
    },
    capacity: batch?.capacity || 30,
    fee: batch?.fee || 0,
    teacher: batch?.teacher?._id || batch?.teacher || '',
    status: batch?.status || 'upcoming'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.name || data.name.trim().length < 3) {
      newErrors.name = 'Batch name must be at least 3 characters';
    }

    if (!data.subject || data.subject.trim().length < 2) {
      newErrors.subject = 'Subject is required';
    }

    if (!data.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!data.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!data.schedule.days || data.schedule.days.length === 0) {
      newErrors.schedule = 'Please select at least one day';
    }

    if (!data.capacity || data.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    } else if (data.capacity > 200) {
      newErrors.capacity = 'Capacity cannot exceed 200';
    }

    if (data.fee === '' || data.fee < 0) {
      newErrors.fee = 'Fee must be 0 or greater';
    }

    if (!data.teacher) {
      newErrors.teacher = 'Please select a teacher';
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

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [name]: value }
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));

    if (errors.schedule) {
      const { schedule, ...rest } = errors;
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
    const loadingToast = toast.loading(batch ? 'Updating batch...' : 'Creating batch...');

    try {
      const url = batch ? `/batches/${batch._id}` : '/batches';
      const method = batch ? 'put' : 'post';
      
      const response = await api[method](url, formData);
      
      if (response.data.success) {
        toast.success(
          batch ? 'Batch updated successfully!' : 'Batch created successfully!',
          { id: loadingToast }
        );
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save batch',
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {batch ? 'Edit Batch' : 'Create New Batch'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {batch ? 'Update batch details' : 'Fill in the details to create a batch'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.name 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
                placeholder="e.g. JEE 2027 Morning"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.subject 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
                placeholder="e.g. Physics + Math"
              />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm resize-none"
              placeholder="Brief description about the batch..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.startDate 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.endDate 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Schedule Days <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => {
                const isSelected = formData.schedule.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {errors.schedule && <p className="mt-1 text-xs text-red-500">{errors.schedule}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.schedule.startTime}
                onChange={handleScheduleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.schedule.endTime}
                onChange={handleScheduleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="200"
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.capacity 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
              {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fee (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.fee 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
              {errors.fee && <p className="mt-1 text-xs text-red-500">{errors.fee}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:ring-4 outline-none transition-all text-sm ${
                  errors.teacher 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              {errors.teacher && <p className="mt-1 text-xs text-red-500">{errors.teacher}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </form>

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
            {loading ? 'Saving...' : (batch ? 'Update Batch' : 'Create Batch')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchForm;