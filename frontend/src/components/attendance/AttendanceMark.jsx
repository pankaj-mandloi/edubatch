import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AttendanceMark = ({ batches, onSuccess }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(false);

  useEffect(() => {
    if (formData.batchId) {
      fetchStudents();
    }
  }, [formData.batchId]);

  useEffect(() => {
    if (formData.batchId && formData.date) {
      checkExistingAttendance();
    }
  }, [formData.batchId, formData.date]);

  const fetchStudents = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/enrollments/batch/${formData.batchId}`);
      if (response.data.success) {
        const studentsList = response.data.data.map(e => e.student);
        setStudents(studentsList);

        const records = {};
        studentsList.forEach(s => {
          records[s._id] = 'present';
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setFetching(false);
    }
  };

  const checkExistingAttendance = async () => {
    try {
      const response = await api.get(`/attendance/batch/${formData.batchId}`);
      if (response.data.success) {
        const targetDate = new Date(formData.date).toDateString();
        const existing = response.data.data.find(
          record => new Date(record.date).toDateString() === targetDate
        );

        if (existing) {
          setExistingAttendance(true);
        } else {
          setExistingAttendance(false);
        }
      }
    } catch (error) {
      console.error('Failed to check existing attendance:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const records = {};
    students.forEach(s => {
      records[s._id] = status;
    });
    setAttendanceRecords(records);
  };

  const handleReset = () => {
    setFormData({ batchId: '', date: new Date().toISOString().split('T')[0] });
    setStudents([]);
    setAttendanceRecords({});
    setExistingAttendance(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batchId) {
      toast.error('Please select a batch');
      return;
    }

    if (students.length === 0) {
      toast.error('No students enrolled in this batch');
      return;
    }

    const records = Object.entries(attendanceRecords).map(([student, status]) => ({
      student,
      status
    }));

    setSubmitting(true);
    const loadingToast = toast.loading('Saving attendance...');

    try {
      const response = await api.post('/attendance', {
        batchId: formData.batchId,
        date: formData.date,
        records
      });

      if (response.data.success) {
        toast.success('Attendance saved successfully!', { id: loadingToast });
        handleReset();
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save attendance',
        { id: loadingToast }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    present: Object.values(attendanceRecords).filter(s => s === 'present').length,
    absent: Object.values(attendanceRecords).filter(s => s === 'absent').length,
    late: Object.values(attendanceRecords).filter(s => s === 'late').length
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Mark Attendance</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Select batch and date, then mark attendance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Batch & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Batch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <AcademicCapIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">Choose a batch...</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} — {batch.subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Existing Attendance Warning */}
        {existingAttendance && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              Attendance for this date already exists. Saving will update the records.
            </p>
          </div>
        )}

        {/* Loading */}
        {fetching && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading students...</p>
          </div>
        )}

        {/* Students */}
        {!fetching && students.length > 0 && (
          <>
            {/* Bulk Actions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserGroupIcon className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{students.length} students</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  All Absent
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Present</p>
                <p className="text-xl font-semibold text-emerald-700 mt-0.5">{stats.present}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-[10px] font-medium text-red-700 uppercase tracking-wider">Absent</p>
                <p className="text-xl font-semibold text-red-700 mt-0.5">{stats.absent}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wider">Late</p>
                <p className="text-xl font-semibold text-amber-700 mt-0.5">{stats.late}</p>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 font-semibold text-sm">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student._id, 'present')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                        attendanceRecords[student._id] === 'present'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-300'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student._id, 'absent')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                        attendanceRecords[student._id] === 'absent'
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student._id, 'late')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                        attendanceRecords[student._id] === 'late'
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300'
                      }`}
                    >
                      Late
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}

        {/* No Students */}
        {!fetching && formData.batchId && students.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
            <UserGroupIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No students enrolled</p>
            <p className="text-xs text-gray-500 mt-1">
              This batch has no active enrollments yet
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AttendanceMark;