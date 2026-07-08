import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Timer, Building2, ArrowRight } from 'lucide-react';
import Input, { Select } from '../ui/Input';
import Button from '../ui/Button';
import friendlyAuthError from '../../lib/errors';

export default function OnboardingWorkspace({ onWorkspaceCreated }) {
  const { user } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (orgName.trim().length < 2) {
      setError('Workspace name must be at least 2 characters.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create the organization row
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          industry: industry,
        })
        .select()
        .single();

      if (orgErr) throw orgErr;

      // 2. Update profiles row
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          org_id: org.id,
          role: 'admin',
        })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      // 3. Callback to trigger profile refetch
      if (onWorkspaceCreated) {
        await onWorkspaceCreated();
      }
    } catch (err) {
      console.error('[OnboardingWorkspace] Error:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-subtle) 0%, transparent 70%)',
          opacity: 0.6,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
            style={{ background: 'var(--accent)', boxShadow: '0 0 32px var(--accent-subtle)' }}
          >
            <Timer size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Chronos</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">One last step to set up your workspace</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 md:p-8 shadow-xl border border-[var(--border-default)] glass-elevated"
          style={{ background: 'var(--bg-surface)' }}
        >
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Building2 className="text-amber-500 w-5 h-5" />
            Create your workspace
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-xs"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'rgb(220, 38, 38)',
                }}
              >
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Organization / Team Name
              </label>
              <Input
                placeholder="e.g. Acme Corp, Design Team"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Industry
              </label>
              <Select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={loading}
              >
                {['Technology', 'Agency', 'Consulting', 'Other'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
