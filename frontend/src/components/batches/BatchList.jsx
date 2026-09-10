import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  ClockIcon,
  BookOpenIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const StatusBadge = ({ status }) => {
  const config = {
    active: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      border: 'border-emerald-200',
      dot: 'bg-emerald-500' 
    },
    upcoming: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-200',
      dot: 'bg-blue-500' 
    },
    archived: { 
      bg: 'bg-gray-50', 
      text: 'text-gray-600', 
      border: 'border-gray-200',
      dot: 'bg-gray-400' 
    }
  };

  const style = config[status] || config.active;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`}></span>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
    </span>
  );
};

const EmptyState = ({ userRole }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <BookOpenIcon className="w-8 h-8 text-emerald-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">No batches found</h3>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">
      {userRole === 'admin' 
        ? 'Create your first batch to get started with managing students and enrollments.' 
        : 'No batches available right now. Check back later for updates.'}
    </p>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-emerald-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
    </div>
  </div>
);

const BatchCard = ({ batch, onEdit, onDelete, onStatusChange, userRole }) => {
  const enrolledCount = batch.enrolledCount || 0;
  const capacity = batch.capacity || 0;
  const fillPercentage = capacity > 0 ? (enrolledCount / capacity) * 100 : 0;
  const availableSeats = capacity - enrolledCount;
  
  const canManage = userRole === 'admin';

  const getProgressColor = () => {
    if (fillPercentage >= 90) return 'from-red-500 to-rose-500';
    if (fillPercentage >= 70) return 'from-amber-500 to-orange-500';
    return 'from-emerald-500 to-green-500';
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 overflow-hidden flex flex-col">
      
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600"></div>

      <div className="p-5 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
              {batch.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <AcademicCapIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs font-normal text-gray-500 truncate">{batch.subject}</p>
            </div>
          </div>
          <StatusBadge status={batch.status} />
        </div>

        {/* Description */}
        {batch.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 pb-4 border-b border-gray-100">
            {batch.description}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
          <InfoItem 
            icon={CalendarDaysIcon} 
            label="Days" 
            value={batch.schedule?.days?.map(d => d.slice(0,3)).join(' • ') || 'N/A'} 
          />
          <InfoItem 
            icon={ClockIcon} 
            label="Time" 
            value={`${batch.schedule?.startTime || '--:--'} - ${batch.schedule?.endTime || '--:--'}`} 
          />
          <InfoItem 
            icon={CurrencyRupeeIcon} 
            label="Fee" 
            value={`₹${batch.fee?.toLocaleString('en-IN') || 0}`} 
          />
          <InfoItem 
            icon={UserGroupIcon} 
            label="Students" 
            value={`${enrolledCount} / ${capacity}`} 
          />
        </div>

        {/* Teacher */}
        {batch.teacher && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/40 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-sm">
                {batch.teacher.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-emerald-600" />
                <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Teacher</p>
              </div>
              <p className="text-sm font-medium text-gray-700 truncate">{batch.teacher.name}</p>
            </div>
          </div>
        )}

        {/* Capacity Progress */}
        <div className="mt-auto mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Seat Availability
            </span>
            <span className={`text-xs font-semibold ${
              availableSeats === 0 ? 'text-red-600' : 
              fillPercentage >= 80 ? 'text-amber-600' : 
              'text-emerald-600'
            }`}>
              {availableSeats === 0 ? 'Full' : `${availableSeats} left`}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-gray-400">{enrolledCount} enrolled</span>
            <span className="text-[10px] text-gray-400">{Math.round(fillPercentage)}% filled</span>
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <select
              value={batch.status}
              onChange={(e) => onStatusChange(batch._id, e.target.value)}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            
            <button
              onClick={() => onEdit(batch)}
              className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
              title="Edit batch"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDelete(batch)}
              className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
              title="Delete batch"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BatchList = ({ batches, onEdit, onDelete, onStatusChange, userRole }) => {
  if (batches.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {batches.map((batch) => (
        <BatchCard
          key={batch._id}
          batch={batch}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          userRole={userRole}
        />
      ))}
    </div>
  );
};

export default BatchList;