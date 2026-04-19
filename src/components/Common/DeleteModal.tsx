import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DeleteModalProps } from '../../types';

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 rounded-full text-red-500">
            <AlertTriangle size={32} />
          </div>
        </div>

        <h3 className="text-xl font-black text-center text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-sm font-bold text-center text-gray-400 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
