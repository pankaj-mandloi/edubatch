import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const ClassCard = ({ classItem, isToday }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
    isToday 
      ? 'bg-emerald-50 border-emerald-200' 
      : 'bg-gray-50 border-gray-100 hover:border-emerald-200'
  }`}>
    {/* Date Badge */}
    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
      isToday 
        ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
        : 'bg-white border border-gray-200'
    }`}>
      <span className={`text-[10px] font-medium uppercase ${
        isToday ? 'text-white/90' : 'text-gray-400'
      }`}>
        {new Date(classItem.date).toLocaleDateString('en-IN', { weekday: 'short' })}
      </span>
      <span className={`text-base font-bold ${
        isToday ? 'text-white' : 'text-gray-700'
      }`}>
        {new Date(classItem.date).getDate()}
      </span>
    </div>

    {/* Details */}
    <div className="flex-1 min-w-0">
      <h4 className={`text-sm font-semibold truncate ${
        isToday ? 'text-emerald-800' : 'text-gray-800'
      }`}>
        {classItem.batchName}
      </h4>
      <p className="text-xs text-gray-500 truncate">{classItem.subject}</p>
      
      <div className="flex flex-wrap items-center gap-3 mt-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
          <ClockIcon className="w-3 h-3" />
          {classItem.startTime} - {classItem.endTime}
        </span>
        {classItem.teacher && (
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
            <UserIcon className="w-3 h-3" />
            {classItem.teacher}
          </span>
        )}
      </div>
    </div>

    {isToday && (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500 text-white flex-shrink-0">
        TODAY
      </span>
    )}
  </div>
);

const UpcomingClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingClasses();
  }, []);

  const fetchUpcomingClasses = async () => {
    try {
      const response = await api.get('/users/upcoming-classes');
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
        <div className="flex items-center justify-center h-full min-h-[420px]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
            <CalendarDaysIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Upcoming Classes</h3>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </div>
        </div>
        {classes.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {classes.length}
          </span>
        )}
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AcademicCapIcon className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">No upcoming classes</p>
            <p className="text-xs text-gray-500 mt-1">
              Check back later for scheduled classes
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {classes.map((classItem, index) => (
            <ClassCard
              key={`${classItem.batchId}-${index}`}
              classItem={classItem}
              isToday={new Date(classItem.date).toDateString() === today}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingClasses;