import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  BellIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinIconSolid } from '@heroicons/react/24/solid';

const EmptyState = ({ canManage }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <BellIcon className="w-8 h-8 text-emerald-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">No notices found</h3>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">
      {canManage
        ? 'Create your first notice to share announcements with students.'
        : 'No notices available right now. Check back later for updates.'}
    </p>
  </div>
);

const NoticeCard = ({ notice, onEdit, onDelete, canManage, currentUserId }) => {
  const isOwner = notice.createdBy?._id === currentUserId || notice.createdBy === currentUserId;
  const canEditThis = canManage && isOwner;
  const isPinned = notice.pinned;
  const isGlobal = !notice.batch;

  return (
    <div className={`group bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
      isPinned
        ? 'border-emerald-300 hover:border-emerald-400 hover:shadow-lg'
        : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg'
    }`}>
      {/* Top Accent Bar */}
      <div className={`h-1 ${
        isPinned
          ? 'bg-gradient-to-r from-emerald-500 to-green-600'
          : 'bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-emerald-500 group-hover:to-green-500'
      } transition-all duration-300`}></div>

      <div className="p-5">
        {/* Header Row - Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Pinned Badge */}
            {isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <MapPinIconSolid className="w-3 h-3 text-emerald-600" />
                Pinned
              </span>
            )}

            {/* Global or Batch Badge */}
            {isGlobal ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <GlobeAltIcon className="w-3 h-3 text-blue-600" />
                Global
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <AcademicCapIcon className="w-3 h-3 text-emerald-600" />
                {notice.batch?.name || 'Batch'}
              </span>
            )}
          </div>

          {/* Actions - Only for owner */}
          {canEditThis && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(notice)}
                // className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                title="Edit notice"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(notice)}
                // className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                title="Delete notice"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-gray-800 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
          {notice.title}
        </h3>

        {/* Body */}
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4 mb-4">
          {notice.body}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-[10px]">
                {notice.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-gray-500 truncate">
              {notice.createdBy?.name || 'Unknown'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
            <CalendarDaysIcon className="w-3.5 h-3.5" />
            <span>
              {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const NoticeList = ({ notices, onEdit, onDelete, canManage, userRole, currentUserId }) => {
  if (notices.length === 0) {
    return <EmptyState canManage={canManage} />;
  }

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {sortedNotices.map((notice) => (
        <NoticeCard
          key={notice._id}
          notice={notice}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default NoticeList;