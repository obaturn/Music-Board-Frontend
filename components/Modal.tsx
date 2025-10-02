
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="spotify-card max-w-md w-full mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
          <div className="text-spotify-gray-light mb-6">
            {children}
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="spotify-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
