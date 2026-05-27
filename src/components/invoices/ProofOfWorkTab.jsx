import { Monitor, Lock } from 'lucide-react';

const APP_USAGE = [
  { app: 'VS Code', duration: '45m', category: 'Development' },
  { app: 'Slack', duration: '15m', category: 'Communication' },
  { app: 'Chrome', duration: '32m', category: 'Research' },
  { app: 'Figma', duration: '28m', category: 'Design' },
];

const ProofOfWorkTab = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Screenshot placeholders */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Screenshots</p>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-xl border border-[var(--border-default)] bg-[var(--bg-sunken)] flex flex-col items-center justify-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center">
                <Lock size={14} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">Requires Desktop App</p>
            </div>
          ))}
        </div>
      </div>

      {/* App usage */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">App Usage</p>
        <div className="space-y-2">
          {APP_USAGE.map((row) => (
            <div
              key={row.app}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-default)] bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[var(--bg-sunken)] border border-[var(--border-default)] flex items-center justify-center">
                  <Monitor size={13} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{row.app}</p>
                  <p className="text-xs text-[var(--text-muted)]">{row.category}</p>
                </div>
              </div>
              <span className="font-mono text-sm text-[var(--text-secondary)]">{row.duration}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3 text-center">Full app usage tracking requires the Chronos Desktop App</p>
      </div>
    </div>
  );
};

export default ProofOfWorkTab;
