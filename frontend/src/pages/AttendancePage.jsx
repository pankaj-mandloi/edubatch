import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import AttendanceMark from '../components/attendance/AttendanceMark';
import AttendanceView from '../components/attendance/AttendanceView';
import api from '../api/axios';
import { CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AttendancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [batches, setBatches] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.role === 'student') {
        const response = await api.get('/attendance/my');
        if (response.data.success) {
          setAttendanceSummary(response.data.data);
        }
      } else {
        const batchesRes = await api.get('/batches');
        if (batchesRes.data.success) {
          setBatches(batchesRes.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
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

  const isStudent = user?.role === 'student';
  const canMark = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isStudent ? 'My Attendance' : 'Attendance'}
          </h1>
          <p className="text-sm text-gray-500">
            {isStudent
              ? 'View your attendance records'
              : 'Mark and manage student attendance'}
          </p>
        </div>

        {canMark && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('mark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'mark'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Mark Attendance
            </button>
          </div>
        )}

        {isStudent ? (
          <AttendanceView data={attendanceSummary} isStudent={true} />
        ) : activeTab === 'overview' ? (
          <AttendanceView data={[]} batches={batches} onRefresh={fetchData} />
        ) : (
          <AttendanceMark batches={batches} onSuccess={fetchData} />
        )}
      </div>
    </Layout>
  );
};

export default AttendancePage;