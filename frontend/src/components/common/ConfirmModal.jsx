import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
      icon: ExclamationTriangleIcon
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      icon: ExclamationTriangleIcon
    },
    info: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
      icon: ExclamationTriangleIcon
    }
  };

  const style = config[type] || config.danger;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-14 h-14 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${style.iconColor}`} />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-500 text-center mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-md hover:shadow-lg transition-all ${style.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;