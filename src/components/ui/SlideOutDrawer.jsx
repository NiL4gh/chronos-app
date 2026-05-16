import { useEffect } from 'react';
import { X } from 'lucide-react';

const SlideOutDrawer = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl shadow-black/60 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <h2 className="text-base font-semibold text-neutral-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 animate-fade-in">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-900">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default SlideOutDrawer;
