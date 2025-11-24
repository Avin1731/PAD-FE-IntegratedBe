"use client";

import React, { useState } from 'react';

interface UnderConstructionModalProps {
  title: string;
  message: string;
}

export default function UnderConstructionModal({ title, message }: UnderConstructionModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100">
        
        {/* Header dengan Ikon */}
        <div className="bg-yellow-50 p-6 text-center border-b border-yellow-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        {/* Body Content */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors w-full sm:w-auto"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}