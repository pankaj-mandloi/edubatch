import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const PaymentButton = ({ enrollmentId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load Razorpay. Please try again.');
        setLoading(false);
        return;
      }

      const orderResponse = await api.post('/payments/create-order', { enrollmentId });
      if (!orderResponse.data.success) {
        toast.error('Failed to create payment order');
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderResponse.data.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'EduBatch',
        description: 'Batch Fee Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await api.post('/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              enrollmentId: enrollmentId
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              if (onSuccess) onSuccess();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Verification error:', error);
          }
          setLoading(false);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#16a34a'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <CurrencyRupeeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{loading ? 'Processing...' : 'Pay Now'}</span>
    </button>
  );
};

export default PaymentButton;