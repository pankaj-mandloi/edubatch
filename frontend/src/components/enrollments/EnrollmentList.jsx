import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ArrowRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const PaymentBadge = ({ status }) => {
  const config = {
    paid: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Paid'
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Pending'
    },
    failed: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
      label: 'Failed'
    },
    waived: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      dot: 'bg-gray-400',
      label: 'Waived'
    }
  };

  const style = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`}></span>
      {style.label}
    </span>
  );
};

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
      <UserGroupIcon className="w-8 h-8 text-emerald-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      {userRole === 'student' ? 'No enrollments yet' : 'No enrollments found'}
    </h3>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">
      {userRole === 'student'
        ? 'Browse available batches and enroll to get started.'
        : 'Enroll students into batches to see them here.'}
    </p>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-emerald-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
    </div>
  </div>
);

const EnrollmentCard = ({ enrollment, onDelete, userRole, onRefresh }) => {
  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student';
  const isPaid = enrollment.paymentStatus === 'paid';
  const isPending = enrollment.paymentStatus === 'pending';

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600"></div>

      <div className="p-5">
        {/* Header - Student Info + Payment Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-sm">
                {enrollment.student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                {enrollment.student?.name || 'Unknown Student'}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {enrollment.student?.email || 'No email'}
              </p>
            </div>
          </div>
          <PaymentBadge status={enrollment.paymentStatus} />
        </div>

        {/* Batch Info Section */}
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/40 mb-4">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <AcademicCapIcon className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                  Batch
                </p>
                <StatusBadge status={enrollment.batch?.status} />
              </div>
              <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
                {enrollment.batch?.name || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {enrollment.batch?.subject || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
          <InfoItem
            icon={CalendarDaysIcon}
            label="Enrolled On"
            value={new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          />
          <InfoItem
            icon={CurrencyRupeeIcon}
            label="Fee"
            value={`₹${enrollment.batch?.fee?.toLocaleString('en-IN') || 0}`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {/* Student Payment Action */}
          {isStudent && isPending && (
            <Link
              to="/payments"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
            >
              <CurrencyRupeeIcon className="w-4 h-4" />
              Pay Now
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          )}

          {/* Student Paid View */}
          {isStudent && isPaid && (
            <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-lg border border-emerald-200">
              <CheckCircleIcon className="w-4 h-4" />
              Payment Completed
            </div>
          )}

          {/* Student Failed */}
          {isStudent && enrollment.paymentStatus === 'failed' && (
            <div className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 text-sm font-medium px-4 py-2 rounded-lg border border-red-200">
              <ExclamationCircleIcon className="w-4 h-4" />
              Payment Failed
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <>
              <div className="flex-1 text-xs text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                {isPending ? 'Payment pending' : isPaid ? 'Enrollment active' : 'Status: ' + enrollment.paymentStatus}
              </div>
              <button
                onClick={() => onDelete(enrollment)}
                className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                title="Remove enrollment"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Teacher view - read only */}
          {userRole === 'teacher' && (
            <div className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200">
              {isPaid ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  Paid
                </>
              ) : isPending ? (
                <>
                  <ClockIcon className="w-4 h-4 text-amber-600" />
                  Payment Pending
                </>
              ) : (
                <>
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                  Payment Failed
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EnrollmentList = ({ enrollments, onDelete, userRole, onRefresh }) => {
  if (enrollments.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {enrollments.map((enrollment) => (
        <EnrollmentCard
          key={enrollment._id}
          enrollment={enrollment}
          onDelete={onDelete}
          userRole={userRole}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default EnrollmentList;