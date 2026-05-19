import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart3, Clock, DollarSign, AlertCircle, ChevronDown, 
  ChevronUp, CheckCircle2, TrendingUp, Calendar, AlertTriangle
} from 'lucide-react';

import { 
  teamMembers, 
  projects, 
  timeLogs, 
  invoices 
} from '../data/mockData';

export default function Dashboard() {
  const { role, handleToast } = useOutletContext();
  const [cadence, setCadence] = useState('Week');
  
  // KPI Expansion State
  const [expandedKpi, setExpandedKpi] = useState(null);
  
  // Chart Selection State
  const [selectedChartDay, setSelectedChartDay] = useState(null);
  
  // Team Pulse Selection State
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  // Helper functions
  const handleKpiClick = (kpiId) => {
    setExpandedKpi(expandedKpi === kpiId ? null : kpiId);
  };

  const handleMemberClick = (memberId) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
  };

  const handleBarClick = (dayStr) => {
    setSelectedChartDay(selectedChartDay === dayStr ? null : dayStr);
  };

  // Process data based on cadence
  // (In a real app, this would dynamically calculate based on 'Today', 'Week', 'Month')
  // For the UI simulation, we will compute some base values and scale them based on cadence.
  const cadenceMultiplier = cadence === 'Today' ? 0.2 : cadence === 'Week' ? 1 : 4.2;
  
  const metrics = {
    hours: (142.5 * cadenceMultiplier).toFixed(1),
    utilization: 82, // percentage
    revenue: (12400 * cadenceMultiplier).toFixed(0),
    uninvoiced: (32 * cadenceMultiplier).toFixed(1)
  };

  // Generate chart data dynamically (7 days for week, 30 for month, 24 for today (hourly))
  const chartBars = useMemo(() => {
    const bars = [];
    const count = cadence === 'Today' ? 12 : cadence === 'Week' ? 7 : 30;
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      if (cadence === 'Today') {
        d.setHours(d.getHours() - i);
        bars.push({
          label: `${d.getHours()}:00`,
          value: Math.random() * 5 + 1,
          dateStr: d.toISOString(),
        });
      } else {
        d.setDate(d.getDate() - i);
        bars.push({
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.random() * 8 + 2,
          dateStr: d.toISOString().split('T')[0],
        });
      }
    }
    return bars;
  }, [cadence]);

  const maxChartValue = Math.max(...chartBars.map(b => b.value), 10);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Overview of team performance and financial health.
          </p>
        </div>
        
        {/* CADENCE TOGGLE */}
        <div className="glass-interactive flex items-center p-1 rounded-full border border-[var(--border-default)]">
          {['Today', 'Week', 'Month'].map(t => (
            <button
              key={t}
              onClick={() => setCadence(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                cadence === t 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('hours')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Total Hours</h3>
            <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {metrics.hours}
            </div>
          </div>
          
          {expandedKpi === 'hours' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Project Breakdown</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Brand Redesign</span>
                  <span className="font-medium text-[var(--text-primary)]">45h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">API Gateway</span>
                  <span className="font-medium text-[var(--text-primary)]">32h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Internal Comms</span>
                  <span className="font-medium text-[var(--text-primary)]">12h</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Utilization Rate */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('utilization')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +5%
              </span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Utilization Rate</h3>
            <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {metrics.utilization}%
            </div>
          </div>
          
          {expandedKpi === 'utilization' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Top Performers</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Daniel Osei</span>
                  <span className="font-medium text-emerald-500">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Priya Sharma</span>
                  <span className="font-medium text-emerald-500">88%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Marcus Webb</span>
                  <span className="font-medium text-amber-500">71%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Est. Revenue */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('revenue')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Est. Revenue</h3>
            <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              ${metrics.revenue}
            </div>
          </div>
          
          {expandedKpi === 'revenue' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Top Clients</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">CloudScale Inc</span>
                  <span className="font-medium text-[var(--text-primary)]">$8,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Acme Corp</span>
                  <span className="font-medium text-[var(--text-primary)]">$3,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">DataStream</span>
                  <span className="font-medium text-[var(--text-primary)]">$700</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Uninvoiced Hours */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300 border-red-500/20">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('uninvoiced')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Uninvoiced Hours</h3>
            <div className="text-3xl font-bold text-red-500 tracking-tight">
              {metrics.uninvoiced}
            </div>
          </div>
          
          {expandedKpi === 'uninvoiced' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToast("Generating invoice draft...", "success");
                }}
                className="w-full py-2 bg-[var(--text-primary)] dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium lift-on-hover press-on-click"
              >
                Create Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE SECTION: CHART + NEEDS ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BAR CHART SECTION */}
        <div className="glass-card lg:col-span-2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Activity Overview</h2>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                Billable
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-neutral-300"></div>
                Internal
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 h-48 relative border-b border-[var(--border-default)] pb-2">
            {chartBars.map((bar, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col justify-end items-center group cursor-pointer h-full"
                onClick={() => handleBarClick(bar.dateStr)}
              >
                <div 
                  className={`w-full max-w-[32px] rounded-t-sm transition-all duration-300 animate-bar-grow ${
                    selectedChartDay === bar.dateStr ? 'bg-amber-400' : 'bg-amber-500/80 group-hover:bg-amber-400'
                  }`}
                  style={{ height: `${(bar.value / maxChartValue) * 100}%`, animationDelay: `${idx * 0.05}s` }}
                ></div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] opacity-70 group-hover:opacity-100">
                  {bar.label}
                </div>
              </div>
            ))}
          </div>

          {/* INLINE CHART DETAILS */}
          {selectedChartDay && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-default)] animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Activity for {selectedChartDay}</h3>
                <button onClick={() => setSelectedChartDay(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <AlertCircle className="w-4 h-4" /> {/* Just a visual close icon placeholder */}
                </button>
              </div>
              <div className="space-y-3">
                {timeLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex justify-between items-center text-sm p-2 hover:bg-[var(--bg-sunken)] rounded-md transition-colors">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{log.task}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{log.projectName} • {log.userName}</p>
                    </div>
                    <div className="font-medium text-amber-500">{log.duration}h</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NEEDS ATTENTION WIDGET */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-status-pulse" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Needs Attention</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 lift-on-hover cursor-pointer transition-all duration-300">
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Overdue Invoice</h3>
              <p className="text-xs text-[var(--text-secondary)]">Meridian Finance (INV-2025-040) is 15 days overdue.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 lift-on-hover cursor-pointer transition-all duration-300">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">Budget Alert</h3>
              <p className="text-xs text-[var(--text-secondary)]">Brand Redesign project has consumed 85% of allocated hours.</p>
            </div>

            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 lift-on-hover cursor-pointer transition-all duration-300">
              <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 mb-1">Missing Time Logs</h3>
              <p className="text-xs text-[var(--text-secondary)]">Aiko Tanaka has 0 logged hours this week.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM PULSE SECTION */}
      <div className="glass-card flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[var(--border-default)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Team Pulse</h2>
        </div>
        <div className="divide-y divide-[var(--border-default)]">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col hover:bg-[var(--bg-sunken)] transition-colors cursor-pointer" onClick={() => handleMemberClick(member.id)}>
              <div className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-secondary)] shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {member.status === 'active' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500 animate-status-pulse"></span>
                    )}
                    {member.status === 'idle' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-amber-500"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{member.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{member.role}</p>
                  </div>
                </div>
                
                <div className="hidden md:block flex-1 max-w-xs mx-8">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Utilization</span>
                    <span className={`font-medium ${member.activityLevel > 80 ? 'text-emerald-500' : member.activityLevel > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                      {member.activityLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border-default)] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${member.activityLevel > 80 ? 'bg-emerald-500' : member.activityLevel > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${member.activityLevel}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{member.hoursWeek}h</div>
                    <div className="text-xs text-[var(--text-secondary)]">this week</div>
                  </div>
                  {expandedMemberId === member.id ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
                </div>
              </div>
              
              {/* INLINE EXPANSION PANEL */}
              {expandedMemberId === member.id && (
                <div className="px-6 py-4 bg-[var(--bg-sunken)] animate-fade-in border-t border-[var(--border-default)]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Current Activity</h4>
                      <p className="text-sm text-[var(--text-primary)]">{member.currentTask || 'No active task'}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{member.currentProject || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Metrics</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">Hourly Rate</span>
                          <span className="font-medium text-[var(--text-primary)]">${member.hourlyRate || 0}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">Capacity</span>
                          <span className="font-medium text-[var(--text-primary)]">{member.availableHoursPerWeek || 40}h/week</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToast(`Message sent to ${member.name}`, "success");
                        }}
                        className="px-4 py-2 bg-[var(--border-default)] text-[var(--text-primary)] rounded-lg text-sm font-medium lift-on-hover press-on-click"
                      >
                        Ping {member.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
