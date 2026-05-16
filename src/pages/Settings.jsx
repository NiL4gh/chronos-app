import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Settings as SettingsIcon, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Workspace Settings</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage your workspace preferences and configuration.</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <SettingsIcon size={16} className="text-violet-400" />
              </div>
              <div>
                <CardTitle>General</CardTitle>
                <CardDescription>Workspace name, timezone, and billing details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-neutral-500">Full settings configuration coming in a future release.</p>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Bell size={16} className="text-violet-400" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Alerts, digests, and team activity notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-neutral-500">Notification preferences coming in a future release.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
