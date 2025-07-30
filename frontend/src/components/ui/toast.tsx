import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, show, duration = 3000, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
};
