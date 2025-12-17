'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'danger';
  showButtons?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
};

const variantConfig = {
  success: {
    iconColor: 'text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  warning: {
    iconColor: 'text-yellow-500', 
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  danger: {
    iconColor: 'text-red-600',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  variant,
  showButtons = true,
  confirmLabel = "Ya",
  cancelLabel = "Batal",
  onConfirm,
}: ConfirmationModalProps) {
  const IconComponent = iconMap[variant];
  const config = variantConfig[variant];
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm?.();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {variant === 'danger' && (
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" strokeWidth={2.5} />
                </div>
              )}
              {variant === 'warning' && (
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-600" strokeWidth={2.5} />
                </div>
              )}
              {variant === 'success' && (
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
                {title}
              </h2>
              <p className="text-center text-gray-600 mb-8 leading-relaxed text-sm">
                {message}
              </p>
            </motion.div>

            {showButtons && (
              <motion.div 
                className="flex gap-3 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium min-w-[100px]"
                >
                  {cancelLabel}
                </button>

                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors min-w-[100px] ${config.buttonColor}`}
                >
                  {confirmLabel}
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}