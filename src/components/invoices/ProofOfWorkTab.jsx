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
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Screenshots</p>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-lg border border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                <Lock size={14} className="text-neutral-600" />
              </div>
              <p className="text-xs text-neutral-600">Requires Desktop App</p>
            </div>
          ))}
        </div>
      </div>

      {/* App usage */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">App Usage</p>
        <div className="space-y-2">
          {APP_USAGE.map((row) => (
            <div
              key={row.app}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-neutral-800 bg-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <Monitor size={13} className="text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-300">{row.app}</p>
                  <p className="text-xs text-neutral-600">{row.category}</p>
                </div>
              </div>
              <span className="font-mono text-sm text-neutral-400">{row.duration}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-600 mt-3 text-center">Full app usage tracking requires the Chronos Desktop App</p>
      </div>
    </div>
  );
};

export default ProofOfWorkTab;
