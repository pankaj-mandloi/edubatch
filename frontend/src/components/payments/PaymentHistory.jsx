import React, { useState } from 'react';
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ReceiptPDF from './ReceiptPDF';

// ✅ Soft pastel status badge with icon
const StatusBadge = ({ status }) => {
  const config = {
    paid: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircleIcon,
      iconColor: 'text-emerald-600',
      label: 'Paid'
    },
    created: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: ClockIcon,
      iconColor: 'text-amber-600',
      label: 'Cancelled'
    },
    failed: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircleIcon,
      iconColor: 'text-red-600',
      label: 'Failed'
    },
    refunded: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CheckCircleIcon,
      iconColor: 'text-blue-600',
      label: 'Refunded'
    }
  };

  const style = config[status] || config.created;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${style.bg} ${style.text} ${style.border} whitespace-nowrap`}>
      <Icon className={`w-3 h-3 ${style.iconColor}`} />
      {style.label}
    </span>
  );
};

const EmptyState = ({ userRole }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 sm:p-16 text-center">
    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
      <CurrencyRupeeIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No payments found</h3>
    <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
      {userRole === 'student'
        ? 'Your payment history will appear here once you complete a payment.'
        : 'No payment transactions recorded yet.'}
    </p>
  </div>
);

// ✅ Mobile Card - Clean, professional
const PaymentMobileCard = ({ payment, userRole, onDownload, onCopy, copied, downloading }) => {
  const paymentIdShort = payment._id?.slice(-8).toUpperCase() || 'N/A';

  const leftBorderColor = {
    paid: 'border-l-emerald-500',
    created: 'border-l-amber-500',
    failed: 'border-l-red-500',
    refunded: 'border-l-blue-500'
  }[payment.status] || 'border-l-gray-400';

  const amountColor = {
    paid: 'text-emerald-700',
    created: 'text-gray-400 line-through',
    failed: 'text-red-600',
    refunded: 'text-blue-600'
  }[payment.status] || 'text-gray-700';

  return (
    <div className={`bg-white border-l-4 ${leftBorderColor} border-t border-r border-b border-gray-200 rounded-r-xl overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-4 space-y-3">
        {/* Top row: Status + Date */}
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={payment.status} />
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <CalendarDaysIcon className="w-3 h-3" />
            <span>
              {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Batch Info */}
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">
              {payment.enrollment?.batch?.name?.charAt(0)?.toUpperCase() || 'B'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {payment.enrollment?.batch?.name || 'N/A'}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {payment.enrollment?.batch?.subject || ''}
            </p>
          </div>
        </div>

        {/* Student (for admin/teacher) */}
        {userRole !== 'student' && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-semibold text-[10px]">
                {payment.student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-800 truncate">
                {payment.student?.name || 'Unknown'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {payment.student?.email || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Amount + ID */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
              Amount
            </p>
            <p className={`text-xl font-bold ${amountColor}`}>
              ₹{payment.amount?.toLocaleString('en-IN') || 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
              Payment ID
            </p>
            <p className="text-[11px] font-mono text-gray-600">
              #{paymentIdShort}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {payment.status === 'paid' && (
            <button
              onClick={() => onDownload(payment)}
              disabled={downloading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              )}
              Receipt
            </button>
          )}
          <button
            onClick={() => onCopy(payment)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {copied === payment._id ? (
              <>
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                Copy ID
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Desktop Table Row - Soft status badge
const PaymentTableRow = ({ payment, userRole, onDownload, onCopy, copied, downloading }) => {
  const paymentIdShort = payment._id?.slice(-8).toUpperCase() || 'N/A';

  const leftBorderColor = {
    paid: 'border-l-emerald-500',
    created: 'border-l-amber-500',
    failed: 'border-l-red-500',
    refunded: 'border-l-blue-500'
  }[payment.status] || 'border-l-gray-400';

  const rowBg = {
    paid: 'hover:bg-emerald-50/30',
    created: 'bg-gray-50/50 hover:bg-gray-50',
    failed: 'bg-red-50/20 hover:bg-red-50/40',
    refunded: 'hover:bg-blue-50/30'
  }[payment.status] || 'hover:bg-gray-50';

  return (
    <tr className={`transition-colors border-l-4 ${leftBorderColor} ${rowBg}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">#{paymentIdShort}</p>
            {payment.razorpayPaymentId && (
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {payment.razorpayPaymentId}
              </p>
            )}
          </div>
        </div>
      </td>

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

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
          {payment.enrollment?.batch?.name || 'N/A'}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[180px]">
          {payment.enrollment?.batch?.subject || ''}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className={`text-sm font-bold ${
          payment.status === 'paid' ? 'text-emerald-700' :
          payment.status === 'failed' ? 'text-red-600' :
          payment.status === 'created' ? 'text-gray-400 line-through' :
          'text-gray-700'
        }`}>
          ₹{payment.amount?.toLocaleString('en-IN') || 0}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={payment.status} />
      </td>

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
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
            Paid on {new Date(payment.paidAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          {payment.status === 'paid' && (
            <button
              onClick={() => onDownload(payment)}
              disabled={downloading}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
              title="Download Receipt"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowDownTrayIcon className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={() => onCopy(payment)}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Copy payment ID"
          >
            {copied === payment._id ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

const PaymentHistory = ({ payments, userRole }) => {
  const [copied, setCopied] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = (payment) => {
    navigator.clipboard.writeText(payment.razorpayPaymentId || payment._id);
    setCopied(payment._id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = async (payment) => {
    if (payment.status !== 'paid') {
      toast.error('Receipt is only available for paid payments');
      return;
    }

    setDownloading(true);
    const loadingToast = toast.loading('Generating receipt...');

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById(`receipt-${payment._id}`);
      if (!element) throw new Error('Receipt element not found');

      const receiptId = payment._id?.slice(-8).toUpperCase() || 'RECEIPT';
      const filename = `EduBatch_Receipt_${receiptId}.pdf`;

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'px',
          format: [800, 1120],
          orientation: 'portrait'
        }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Receipt downloaded!', { id: loadingToast });
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download receipt', { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  if (payments.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  return (
    <>
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {payments.map((payment) => (
          <ReceiptPDF key={payment._id} payment={payment} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">Payment History</h3>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            {payments.length} transaction{payments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-3 sm:p-4 space-y-3 bg-gray-50/50">
          {payments.map((payment) => (
            <PaymentMobileCard
              key={payment._id}
              payment={payment}
              userRole={userRole}
              onDownload={handleDownload}
              onCopy={handleCopy}
              copied={copied}
              downloading={downloading}
            />
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <PaymentTableRow
                  key={payment._id}
                  payment={payment}
                  userRole={userRole}
                  onDownload={handleDownload}
                  onCopy={handleCopy}
                  copied={copied}
                  downloading={downloading}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PaymentHistory;