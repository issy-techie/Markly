import React from "react";

interface ModalProps {
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Generic modal component.
 * - Closes on backdrop click
 * - Content click does not propagate
 */
const Modal: React.FC<ModalProps> = ({ onClose, className = "", children }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default Modal;
