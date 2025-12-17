'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  subMessage?: string;
  buttonText?: string;
}

export default function SuccessDialog({
  isOpen,
  onClose,
  title,
  message,
  subMessage,
  buttonText = 'OK'
}: SuccessDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
              {title}
            </h3>

            {/* Message */}
            {message && (
              <p className="text-gray-600 text-center mb-2 text-sm">
                {message}
              </p>
            )}

            {/* Sub Message */}
            {subMessage && (
              <p className="text-sm text-center mb-8 font-medium text-green-600">
                {subMessage}
              </p>
            )}

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              {buttonText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
