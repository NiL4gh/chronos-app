import React from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { getProjectColor } from '../../lib/myTimeHelpers';

export default function EntryPopover({ selectedEntry, setSelectedEntry, setDrawerEntry, setDrawerOpen, deleteEntry, logsToRender, setLogsToRender }) {
  if (!selectedEntry) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setSelectedEntry(null)} />
      <div
        className="fixed z-50 w-72 rounded-xl shadow-2xl animate-fade-in"
        style={{
          top: `${selectedEntry.y}px`,
          left: `${selectedEntry.x}px`,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Popover header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: getProjectColor(selectedEntry.log.projectId) }}
            />
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {selectedEntry.log.task || '(No description)'}
            </span>
          </div>
          <button
            onClick={() => setSelectedEntry(null)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors ml-2 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>

        {/* Popover body */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>Project</span>
            <span>{selectedEntry.log.projectName || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>Date</span>
            <span>{selectedEntry.log.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>Time</span>
            <span>
              {selectedEntry.log.startTime || '?'} – {selectedEntry.log.endTime || '?'}
              {' '}
              <span className="font-mono">({selectedEntry.log.duration?.toFixed(2)}h)</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium w-14 shrink-0" style={{ color: 'var(--text-muted)' }}>Source</span>
            <span className="capitalize">{selectedEntry.log.source || 'manual'}</span>
          </div>
          {selectedEntry.log.billable && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'rgb(5,150,105)' }}>
              <span>● Billable</span>
            </div>
          )}
        </div>

        {/* Popover footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <button
            onClick={() => {
              setDrawerEntry({
                ...selectedEntry.log,
                task: selectedEntry.log.task,
                projectId: selectedEntry.log.projectId,
                date: selectedEntry.log.date,
                startTime: selectedEntry.log.startTime || '',
                endTime: selectedEntry.log.endTime || '',
                billable: selectedEntry.log.billable ?? true,
                editId: selectedEntry.log.id,
              });
              setDrawerOpen(true);
              setSelectedEntry(null);
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}
          >
            Edit entry
          </button>

          <div className="flex items-center gap-1">
            {selectedEntry.log.link && (
              <a
                href={selectedEntry.log.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Open in Google Calendar"
              >
                <ExternalLink size={13} />
              </a>
            )}
            <button
              onClick={() => {
                if (window.confirm('Delete this time entry?')) {
                  const newLogs = logsToRender.filter(log => log.id !== selectedEntry.log.id);
                  setLogsToRender(newLogs);
                  deleteEntry(selectedEntry.log.id);
                  setSelectedEntry(null);
                }
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--danger-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--danger-text) 10%, transparent)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="Delete entry"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
