import React, { useState } from 'react';
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ReceiptPDF from './ReceiptPDF';

const StatusBadge = ({ status }) => {
  const config = {
    paid: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      dot: 'bg-emerald-600',
      label: 'Paid'
    },
    created: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      dot: 'bg-amber-600',
      label: 'Cancelled'
    },
    failed: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      dot: 'bg-red-600',
      label: 'Failed'
    },
    refunded: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      dot: 'bg-blue-600',
      label: 'Refunded'
    }
  };

  const style = config[status] || config.created;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
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

const PaymentRow = ({ payment, userRole }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ NEW: Download PDF function
  const handleDownloadPDF = async () => {
    if (payment.status !== 'paid') {
      toast.error('Receipt is only available for paid payments');
      return;
    }

    setDownloading(true);
    const loadingToast = toast.loading('Generating receipt...');

    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById(`receipt-${payment._id}`);
      if (!element) {
        throw new Error('Receipt element not found');
      }

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
            <p className="text-sm font-medium text-gray-800">#{paymentIdShort}</p>
            {payment.razorpayPaymentId && (
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {payment.razorpayPaymentId}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Student (admin/teacher only) */}
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

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          {/* ✅ Download PDF — only for paid */}
          {payment.status === 'paid' && (
            <button
              onClick={handleDownloadPDF}
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

          {/* Copy payment ID */}
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
        </div>
      </td>
    </tr>
  );
};

const PaymentHistory = ({ payments, userRole }) => {
  if (payments.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  return (
    <>
      {/* Hidden receipt templates for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {payments.map((payment) => (
          <ReceiptPDF key={payment._id} payment={payment} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Payment History</h3>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <PaymentRow
                  key={payment._id}
                  payment={payment}
                  userRole={userRole}
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