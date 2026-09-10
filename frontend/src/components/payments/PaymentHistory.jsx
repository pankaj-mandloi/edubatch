import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const StatusBadge = ({ status }) => {
  const config = {
    paid: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Paid'
    },
    created: {
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
    refunded: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      dot: 'bg-gray-400',
      label: 'Refunded'
    }
  };

  const style = config[status] || config.created;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`}></span>
      {style.label}
    </span>
  );
};

const EmptyState = ({ userRole }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <CurrencyRupeeIcon className="w-8 h-8 text-emerald-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">No payments found</h3>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">
      {userRole === 'student'
        ? 'Your payment history will appear here once you complete a payment.'
        : 'No payment transactions recorded yet.'}
    </p>
  </div>
);

const PaymentRow = ({ payment, userRole, index }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentIdShort = payment._id?.slice(-8).toUpperCase() || 'N/A';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Payment ID */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">
              #{paymentIdShort}
            </p>
            {payment.razorpayPaymentId && (
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {payment.razorpayPaymentId}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Student - Hidden for student view */}
      {userRole !== 'student' && (
        <td className="px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-xs">
                {payment.student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {payment.student?.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {payment.student?.email || 'N/A'}
              </p>
            </div>
          </div>
        </td>
      )}

      {/* Batch */}
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
          {payment.enrollment?.batch?.name || 'N/A'}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[180px]">
          {payment.enrollment?.batch?.subject || ''}
        </p>
      </td>

      {/* Amount */}
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-800">
          ₹{payment.amount?.toLocaleString('en-IN') || 0}
        </p>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={payment.status} />
      </td>

      {/* Date */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDaysIcon className="w-3.5 h-3.5" />
          <span>
            {new Date(payment.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        {payment.paidAt && (
          <p className="text-[10px] text-emerald-600 mt-0.5">
            Paid on {new Date(payment.paidAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
        )}
      </td>

      {/* Copy button */}
      <td className="px-5 py-4 text-right">
        <button
          onClick={() => copyToClipboard(payment.razorpayPaymentId || payment._id)}
          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Copy payment ID"
        >
          {copied ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
          ) : (
            <DocumentDuplicateIcon className="w-4 h-4" />
          )}
        </button>
      </td>
    </tr>
  );
};

const PaymentHistory = ({ payments, userRole }) => {
  if (payments.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">
          Payment History
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {payments.length} transaction{payments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              {userRole !== 'student' && (
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Student
                </th>
              )}
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment, index) => (
              <PaymentRow
                key={payment._id}
                payment={payment}
                userRole={userRole}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;