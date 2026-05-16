import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from '../ui/Toast';
import SlideOutDrawer from '../ui/SlideOutDrawer';
import Button from '../ui/Button';
import { Input, Select } from '../ui/Input';
import Toggle from '../ui/Toggle';

const AppShell = ({ role = 'admin', onRoleChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, title: '', message: '', variant: 'success' });

  const triggerToast = (title, message, variant = 'success') => {
    setToast({ visible: true, title, message, variant });
  };

  const dismissToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // "Add Manual Time" drawer state
  const [manualTimeOpen, setManualTimeOpen] = useState(false);
  const [manualTimeForm, setManualTimeForm] = useState({
    task: '',
    project: '',
    date: '',
    startTime: '',
    endTime: '',
    billable: false,
  });

  const handleManualTimeSave = () => {
    setManualTimeOpen(false);
    setManualTimeForm({ task: '', project: '', date: '', startTime: '', endTime: '', billable: false });
    triggerToast('Time logged', 'Your manual entry has been saved.', 'success');
  };

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} role={role} />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          collapsed={collapsed}
          onLogTime={() => setManualTimeOpen(true)}
          onStartTimer={() => triggerToast('Timer started', 'Your timer is running. Stop it anytime from My Time.', 'success')}
          role={role}
          onRoleChange={onRoleChange}
        />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {role === 'employee' && (
            <div className="mb-6 flex items-center justify-between px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
                <p className="text-xs font-medium text-amber-400">Viewing as Employee — Niloy Pal</p>
                <p className="text-xs text-neutral-500">You are seeing the restricted employee interface.</p>
              </div>
              <button
                onClick={() => onRoleChange('admin')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors duration-150"
              >
                Switch back to Admin
              </button>
            </div>
          )}
          <Outlet context={{ triggerToast, role }} />
        </main>
      </div>

      {/* Add Manual Time Drawer */}
      <SlideOutDrawer
        isOpen={manualTimeOpen}
        onClose={() => setManualTimeOpen(false)}
        title="Add Manual Time"
        footer={
          <>
            <Button variant="secondary" onClick={() => setManualTimeOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleManualTimeSave}>Save Entry</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Task Description</label>
            <Input
              placeholder="What were you working on?"
              value={manualTimeForm.task}
              onChange={(e) => setManualTimeForm((prev) => ({ ...prev, task: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Project</label>
            <Select
              value={manualTimeForm.project}
              onChange={(e) => setManualTimeForm((prev) => ({ ...prev, project: e.target.value }))}
            >
              <option value="">Select a project...</option>
              <option value="p1">Acme Corp Rebrand</option>
              <option value="p2">FinTrack Dashboard</option>
              <option value="p3">Mobile App v3</option>
              <option value="p4">Marketing Site</option>
              <option value="p5">API Integration</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Date</label>
            <Input
              type="date"
              value={manualTimeForm.date}
              onChange={(e) => setManualTimeForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Start Time</label>
              <Input
                type="time"
                value={manualTimeForm.startTime}
                onChange={(e) => setManualTimeForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">End Time</label>
              <Input
                type="time"
                value={manualTimeForm.endTime}
                onChange={(e) => setManualTimeForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-neutral-300">Billable</p>
              <p className="text-xs text-neutral-500 mt-0.5">Include in client invoices</p>
            </div>
            <Toggle
              checked={manualTimeForm.billable}
              onChange={(val) => setManualTimeForm((prev) => ({ ...prev, billable: val }))}
              size="sm"
            />
          </div>
        </div>
      </SlideOutDrawer>

      {/* Global Toast */}
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
        onDismiss={dismissToast}
      />
    </div>
  );
};

export default AppShell;
