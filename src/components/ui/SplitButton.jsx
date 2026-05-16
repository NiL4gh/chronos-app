import { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileText, FileDown, Table2 } from 'lucide-react';

const SplitButton = ({ onExport }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOption = (format) => {
    setOpen(false);
    if (onExport) onExport(format);
  };

  return (
    <div ref={ref} className="relative inline-flex rounded-lg overflow-visible">
      {/* Main action */}
      <button
        onClick={() => handleOption('csv')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-l-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium transition-colors duration-150 border-r border-violet-400/40"
      >
        <Download size={14} />
        Export to CSV
      </button>

      {/* Dropdown trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center px-2.5 py-2 rounded-r-lg bg-violet-500 hover:bg-violet-400 text-white transition-colors duration-150"
      >
        <ChevronDown size={14} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-neutral-700 bg-neutral-800 shadow-xl shadow-black/40 z-20 overflow-hidden">
          <button
            onClick={() => handleOption('csv')}
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5 transition-colors duration-100"
          >
            <FileText size={13} className="text-neutral-500" />
            Export to CSV
          </button>
          <button
            onClick={() => handleOption('pdf')}
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5 transition-colors duration-100"
          >
            <FileDown size={13} className="text-neutral-500" />
            Export to PDF
          </button>
          <button
            onClick={() => handleOption('excel')}
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5 transition-colors duration-100"
          >
            <Table2 size={13} className="text-neutral-500" />
            Export to Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default SplitButton;
