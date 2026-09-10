import React from 'react';

const ReceiptPDF = ({ payment, user }) => {
  const receiptId = payment._id?.slice(-8).toUpperCase() || 'N/A';
  const paidDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div
      id={`receipt-${payment._id}`}
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '800px',
        padding: '40px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '3px solid #10b981',
          paddingBottom: '20px',
          marginBottom: '30px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 'bold',
              }}
            >
              E
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  color: '#059669',
                  fontWeight: 'bold',
                }}
              >
                EduBatch
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#6b7280',
                }}
              >
                Education Batch Management Platform
              </p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              color: '#059669',
              fontWeight: 'bold',
            }}
          >
            PAYMENT RECEIPT
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            Receipt #{receiptId}
          </p>
        </div>
      </div>

      {/* Billed To & Receipt Details */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          gap: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '10px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Billed To
          </p>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0',
            }}
          >
            {payment.student?.name || user?.name || 'N/A'}
          </p>
          <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 2px 0' }}>
            {payment.student?.email || user?.email || 'N/A'}
          </p>
          {payment.student?.phone && (
            <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>
              {payment.student.phone}
            </p>
          )}
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p
            style={{
              fontSize: '10px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Receipt Details
          </p>
          <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 4px 0' }}>
            <strong>Date:</strong> {paidDate}
          </p>
          <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 4px 0' }}>
            <strong>Status:</strong>{' '}
            <span style={{ color: '#059669', fontWeight: 'bold' }}>PAID</span>
          </p>
        </div>
      </div>

      {/* Batch Details */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            color: '#047857',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
            fontWeight: 'bold',
          }}
        >
          Batch Information
        </p>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 4px 0',
          }}
        >
          {payment.enrollment?.batch?.name || 'N/A'}
        </p>
        <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>
          Subject: {payment.enrollment?.batch?.subject || 'N/A'}
        </p>
      </div>

      {/* Payment Summary Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '24px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#059669' }}>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                color: '#ffffff',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold',
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'right',
                color: '#ffffff',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold',
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: '#ffffff' }}>
            <td
              style={{
                padding: '14px 16px',
                fontSize: '13px',
                color: '#1f2937',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              Batch Fee — {payment.enrollment?.batch?.name || 'N/A'}
            </td>
            <td
              style={{
                padding: '14px 16px',
                fontSize: '13px',
                color: '#1f2937',
                textAlign: 'right',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              ₹{payment.amount?.toLocaleString('en-IN') || 0}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <td
              style={{
                padding: '14px 16px',
                fontSize: '13px',
                color: '#4b5563',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              Currency
            </td>
            <td
              style={{
                padding: '14px 16px',
                fontSize: '13px',
                color: '#4b5563',
                textAlign: 'right',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              {payment.currency || 'INR'}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f0fdf4' }}>
            <td
              style={{
                padding: '16px',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#065f46',
                borderTop: '2px solid #059669',
              }}
            >
              TOTAL PAID
            </td>
            <td
              style={{
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#065f46',
                textAlign: 'right',
                borderTop: '2px solid #059669',
              }}
            >
              ₹{payment.amount?.toLocaleString('en-IN') || 0}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Transaction Details */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            fontWeight: 'bold',
          }}
        >
          Transaction Details
        </p>
        <table style={{ width: '100%', fontSize: '11px', color: '#4b5563' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', width: '180px' }}>
                <strong>Payment ID:</strong>
              </td>
              <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>
                {payment.razorpayPaymentId || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>
                <strong>Order ID:</strong>
              </td>
              <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>
                {payment.razorpayOrderId || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>
                <strong>Receipt No:</strong>
              </td>
              <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>
                {payment.receipt || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Success Stamp */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '10px 28px',
            border: '3px solid #059669',
            borderRadius: '8px',
            color: '#059669',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            transform: 'rotate(-3deg)',
          }}
        >
          ✓ PAID
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0' }}>
          Thank you for your payment!
        </p>
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
          This is a computer-generated receipt. No signature required.
        </p>
        <p
          style={{
            fontSize: '10px',
            color: '#9ca3af',
            marginTop: '8px',
            marginBottom: 0,
          }}
        >
          © {new Date().getFullYear()} EduBatch · support@edubatch.com
        </p>
      </div>
    </div>
  );
};

export default ReceiptPDF;