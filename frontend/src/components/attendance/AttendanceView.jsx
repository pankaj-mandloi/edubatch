import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const EmptyState = ({ isStudent }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <ChartBarIcon className="w-8 h-8 text-emerald-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">No attendance records</h3>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">
      {isStudent
        ? 'Your attendance records will appear here once your teacher starts marking attendance.'
        : 'Select a batch above to view attendance records.'}
    </p>
  </div>
);

const AttendanceStats = ({ summary }) => {
  const {
    totalDays = 0,
    presentDays = 0,
    absentDays = 0,
    lateDays = 0,
    attendancePercentage = 0
  } = summary || {};

  const getPercentageColor = () => {
    if (attendancePercentage >= 75) return 'text-emerald-600';
    if (attendancePercentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (attendancePercentage >= 75) return 'from-emerald-500 to-green-500';
    if (attendancePercentage >= 50) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Attendance Rate
          </span>
          <span className={`text-lg font-semibold ${getPercentageColor()}`}>
            {attendancePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700`}
            style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-lg font-semibold text-gray-800 mt-0.5">{totalDays}</p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Present</p>
          <p className="text-lg font-semibold text-emerald-700 mt-0.5">{presentDays}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[10px] font-medium text-red-700 uppercase tracking-wider">Absent</p>
          <p className="text-lg font-semibold text-red-700 mt-0.5">{absentDays}</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wider">Late</p>
          <p className="text-lg font-semibold text-amber-700 mt-0.5">{lateDays}</p>
        </div>
      </div>
    </div>
  );
};

const StudentBatchCard = ({ item }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-t-xl"></div>

    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <AcademicCapIcon className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-gray-800 truncate">
            {item.batch?.name || 'Unknown Batch'}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {item.batch?.subject || 'N/A'}
          </p>
        </div>
      </div>

      <AttendanceStats summary={item.summary} />
    </div>
  </div>
);

const AttendanceView = ({ data, isStudent = false, batches = [] }) => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchRecords, setBatchRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isStudent && selectedBatch) {
      fetchBatchRecords();
    }
  }, [selectedBatch]);

  const fetchBatchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/batch/${selectedBatch}`);
      if (response.data.success) {
        setBatchRecords(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch batch records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isStudent) {
    if (!data || data.length === 0) {
      return <EmptyState isStudent={true} />;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {data.map((item, index) => (
          <StudentBatchCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Batch to View Records
        </label>
        <div className="relative max-w-md">
          <AcademicCapIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
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

      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Loading records...</p>
        </div>
      )}

      {!loading && !selectedBatch && <EmptyState isStudent={false} />}

      {!loading && selectedBatch && batchRecords && (
        <>
          {batchRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <CalendarDaysIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">No attendance records yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Start marking attendance to see records here
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-800">
                  Attendance Records
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {batchRecords.length} record{batchRecords.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {batchRecords.map((record) => {
                  const stats = {
                    present: record.records.filter(r => r.status === 'present').length,
                    absent: record.records.filter(r => r.status === 'absent').length,
                    late: record.records.filter(r => r.status === 'late').length,
                    total: record.records.length
                  };

                  return (
                    <div key={record._id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-800">
                            {new Date(record.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          By: {record.markedBy?.name || 'Unknown'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                          <p className="text-[10px] font-medium text-gray-500 uppercase">Total</p>
                          <p className="text-base font-semibold text-gray-800">{stats.total}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                          <p className="text-[10px] font-medium text-emerald-700 uppercase">Present</p>
                          <p className="text-base font-semibold text-emerald-700">{stats.present}</p>
                        </div>
                        <div className="p-2.5 bg-red-50 rounded-lg border border-red-100 text-center">
                          <p className="text-[10px] font-medium text-red-700 uppercase">Absent</p>
                          <p className="text-base font-semibold text-red-700">{stats.absent}</p>
                        </div>
                        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-center">
                          <p className="text-[10px] font-medium text-amber-700 uppercase">Late</p>
                          <p className="text-base font-semibold text-amber-700">{stats.late}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceView;