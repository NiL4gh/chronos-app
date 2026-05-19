import React, { useState, useMemo } from 'react';
import { 
  Download, Filter, TrendingUp, Clock, DollarSign, Users, 
  ChevronDown, ChevronUp, X, CheckCircle2 
} from 'lucide-react';
import Button from '../components/ui/Button';
import SplitButton from '../components/ui/SplitButton';
import Badge from '../components/ui/Badge';
import Input, { Select } from '../components/ui/Input';
import { useOutletContext } from 'react-router-dom';

import { teamMembers, projects, timeLogs, billingRates } from '../data/mockData';

// Helper to track active badges
function TrackingSourceBadge({ source }) {
  return source === 'auto' ? (
    <Badge variant="violet">Auto</Badge>
  ) : (
    <Badge variant="neutral">Manual</Badge>
  );
}

export default function Reports() {
  const { triggerToast, role } = useOutletContext();
  
  // Default dates
  const defaultEnd = new Date().toISOString().split('T')[0];
  const past14 = new Date();
  past14.setDate(past14.getDate() - 14);
  const defaultStart = past14.toISOString().split('T')[0];

  // Filter State
  const [filterStart, setFilterStart] = useState(defaultStart);
  const [filterEnd, setFilterEnd] = useState(defaultEnd);
  const [filterMember, setFilterMember] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  // Interactive States
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [selectedChartDate, setSelectedChartDate] = useState(null);
  const [selectedDonutSegment, setSelectedDonutSegment] = useState(null);
  const [expandedMembersTable, setExpandedMembersTable] = useState({});
  const [selectedReportsMember, setSelectedReportsMember] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Options
  const memberOptions = ['All Members', ...teamMembers.map(m => m.id)];
  const getMemberLabel = (id) => id === 'All Members' ? 'All Members' : teamMembers.find(m => m.id === id)?.name || id;
  
  const projectOptions = ['All Projects', ...projects.map(p => p.id)];
  const getProjectLabel = (id) => id === 'All Projects' ? 'All Projects' : projects.find(p => p.id === id)?.name || id;

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return timeLogs.filter(log => {
      if (log.date < filterStart || log.date > filterEnd) return false;
      if (filterMember !== 'all' && log.userId !== filterMember) return false;
      if (filterProject !== 'all' && log.projectId !== filterProject) return false;
      return true;
    });
  }, [timeLogs, filterStart, filterEnd, filterMember, filterProject]);

  // Metrics
  const totalHours = filteredLogs.reduce((acc, log) => acc + log.duration, 0);
  const billableLogs = filteredLogs.filter(log => log.billable);
  const billableHours = billableLogs.reduce((acc, log) => acc + log.duration, 0);
  const revenue = billableHours * (billingRates?.default || 95);
  const activeMembersSet = new Set(filteredLogs.map(log => log.userId));
  const activeMembersCount = activeMembersSet.size;

  // Bar Chart Data (Daily Hours)
  const dailyData = useMemo(() => {
    const map = {};
    // ensure all dates in range are represented or just ones with data?
    // the prompt says "One bar per day in filteredLogs date range. Max 14 bars."
    filteredLogs.forEach(log => {
      if (!map[log.date]) map[log.date] = { hours: 0, members: new Set() };
      map[log.date].hours += log.duration;
      map[log.date].members.add(log.userId);
    });
    let sortedDates = Object.keys(map).sort();
    if (sortedDates.length > 14) sortedDates = sortedDates.slice(-14); // Max 14
    return sortedDates.map(date => ({
      date,
      hours: map[date].hours,
      membersCount: map[date].members.size
    }));
  }, [filteredLogs]);

  const maxDaily = Math.max(...dailyData.map(d => d.hours), 1);

  // Donut Chart Data
  const nonBillableHours = totalHours - billableHours;
  const billablePct = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const billableDashoffset = circumference * (1 - billablePct / 100);

  // Table Data (grouped by member)
  const logsForTable = useMemo(() => {
    return filteredLogs.filter(log => {
      if (selectedDonutSegment === 'billable' && !log.billable) return false;
      if (selectedDonutSegment === 'non-billable' && log.billable) return false;
      return true;
    });
  }, [filteredLogs, selectedDonutSegment]);

  const groupedByMember = useMemo(() => {
    const map = {};
    logsForTable.forEach(log => {
      if (!map[log.userId]) {
        const mem = teamMembers.find(m => m.id === log.userId);
        map[log.userId] = {
          member: mem,
          logs: [],
          totalHours: 0
        };
      }
      map[log.userId].logs.push(log);
      map[log.userId].totalHours += log.duration;
    });
    return Object.values(map).sort((a, b) => b.totalHours - a.totalHours);
  }, [logsForTable]);

  const toggleMemberTable = (id) => {
    setExpandedMembersTable(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedMemberData = selectedReportsMember ? teamMembers.find(m => m.id === selectedReportsMember) : null;
  const selectedMemberLogs = selectedMemberData ? filteredLogs.filter(l => l.userId === selectedMemberData.id) : [];

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in relative z-10" style={{ background: 'var(--bg-base)' }}>
        
        {/* FILTER BAR */}
        <div className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">From</label>
              <Input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">To</label>
              <Input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
            </div>
            
            <div className="w-px h-8 bg-[var(--border-default)] hidden md:block mb-1" />
            
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Member</label>
              <Select value={filterMember} onChange={e => setFilterMember(e.target.value)}>
                {memberOptions.map(m => <option key={m} value={m}>{getMemberLabel(m)}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Project</label>
              <Select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                {projectOptions.map(p => <option key={p} value={p}>{getProjectLabel(p)}</option>)}
              </Select>
            </div>
          </div>
        </div>

        {/* SUMMARY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'total', label: 'Total Hours', val: totalHours.toFixed(1), icon: Clock },
            { id: 'billable', label: 'Billable Hours', val: billableHours.toFixed(1), icon: TrendingUp },
            { id: 'rev', label: 'Est. Revenue', val: '$' + revenue.toLocaleString(), icon: DollarSign },
            { id: 'active', label: 'Active Members', val: activeMembersCount, icon: Users },
          ].map(metric => (
            <div 
              key={metric.id} 
              className="glass-interactive lift-on-hover p-5 cursor-pointer relative"
              onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-500">
                  <metric.icon size={16} />
                </div>
              </div>
              <p className="font-mono text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{metric.val}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
        
        {/* INLINE METRIC EXPANSION */}
        {expandedMetric && (
          <div className="glass-card p-4 animate-fade-in -mt-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {expandedMetric === 'total' && "Total hours logged across all applied filters in the specified period."}
              {expandedMetric === 'billable' && `This represents ${billablePct}% of total logged time.`}
              {expandedMetric === 'rev' && "Calculated using the default blended rate of $" + (billingRates?.default || 95) + "/hr."}
              {expandedMetric === 'active' && "Count of unique team members who have logged time matching filters."}
            </p>
          </div>
        )}

        {/* TWO COLUMN CHART ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BAR CHART */}
          <div className="glass-card lg:col-span-2 p-6 flex flex-col relative">
            <h3 className="text-base font-medium text-neutral-900 dark:text-white mb-6">Daily Hours</h3>
            
            <div className="flex-1 flex items-end gap-2 h-48 border-b border-[var(--border-default)] pb-2 relative">
              {dailyData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">No data for selected period</div>
              ) : dailyData.map((d, i) => (
                <div 
                  key={d.date}
                  className="flex-1 flex flex-col justify-end items-center group cursor-pointer h-full relative"
                  onClick={() => setSelectedChartDate(selectedChartDate === d.date ? null : d.date)}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-neutral-900 dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none">
                    {d.date} — {d.hours.toFixed(1)}h logged by {d.membersCount} members
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-sm transition-all duration-300 animate-bar-grow ${
                      selectedChartDate === d.date ? 'bg-amber-400' : 'bg-amber-400/80 group-hover:bg-amber-400'
                    }`}
                    style={{ 
                      height: `${(d.hours / maxDaily) * 100}%`, 
                      animationDelay: `${i * 40}ms`
                    }}
                  />
                  <div className="mt-3 text-[10px] text-neutral-500 opacity-70 group-hover:opacity-100 truncate w-full text-center">
                    {d.date.substring(5)}
                  </div>
                </div>
              ))}
            </div>

            {/* INLINE DAY DETAIL PANEL */}
            {selectedChartDate && (
              <div className="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 animate-fade-in glass-elevated">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Activity for {selectedChartDate}</h3>
                  <button onClick={() => setSelectedChartDate(null)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredLogs.filter(l => l.date === selectedChartDate).map(log => {
                    const proj = projects.find(p => p.id === log.projectId);
                    const mem = teamMembers.find(m => m.id === log.userId);
                    return (
                      <div key={log.id} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-black/20 rounded-md border border-[var(--border-default)]">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {mem?.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                              {log.task}
                              {log.billable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                            </p>
                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj?.color || '#ccc' }}></span>
                              {proj?.name || log.projectName} • {mem?.name || log.userName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <TrackingSourceBadge source={log.source} />
                          <span className="font-mono font-semibold text-neutral-900 dark:text-white">{log.duration.toFixed(1)}h</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DONUT CHART */}
          <div className="glass-card p-6 flex flex-col items-center">
            <h3 className="text-base font-medium text-neutral-900 dark:text-white w-full text-left mb-6">Billable Split</h3>
            <div className="relative w-40 h-40 mb-6">
              <svg viewBox="0 0 100 100" className="-rotate-90 w-40 h-40">
                {/* Non-billable Segment */}
                <circle 
                  cx="50" cy="50" r={radius} fill="none" 
                  stroke="#d4cdc4" 
                  strokeWidth={selectedDonutSegment === 'non-billable' ? "14" : "12"}
                  className={`cursor-pointer transition-all duration-300 ${selectedDonutSegment === 'billable' ? 'opacity-30' : ''}`}
                  onClick={() => setSelectedDonutSegment(s => s === 'non-billable' ? null : 'non-billable')}
                />
                {/* Billable Segment */}
                <circle
                  cx="50" cy="50" r={radius} fill="none"
                  stroke="#fbbf24" 
                  strokeWidth={selectedDonutSegment === 'billable' ? "14" : "12"}
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${billableDashoffset}`}
                  className={`cursor-pointer transition-all duration-300 ${selectedDonutSegment === 'non-billable' ? 'opacity-30' : ''}`}
                  onClick={() => setSelectedDonutSegment(s => s === 'billable' ? null : 'billable')}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-mono font-black text-neutral-900 dark:text-white">{billablePct}%</span>
                <span className="text-xs text-neutral-500">billable</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <div 
                className={`flex items-center justify-between cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${selectedDonutSegment === 'billable' ? 'bg-black/5 dark:bg-white/5 font-semibold' : ''}`}
                onClick={() => setSelectedDonutSegment(s => s === 'billable' ? null : 'billable')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Billable</span>
                </div>
                <span className="text-sm font-mono text-neutral-900 dark:text-white">{billableHours.toFixed(1)}h</span>
              </div>
              <div 
                className={`flex items-center justify-between cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${selectedDonutSegment === 'non-billable' ? 'bg-black/5 dark:bg-white/5 font-semibold' : ''}`}
                onClick={() => setSelectedDonutSegment(s => s === 'non-billable' ? null : 'non-billable')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#d4cdc4]" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Internal</span>
                </div>
                <span className="text-sm font-mono text-neutral-900 dark:text-white">{nonBillableHours.toFixed(1)}h</span>
              </div>
            </div>

            {selectedDonutSegment && (
              <div className="mt-4 w-full p-2 text-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded animate-fade-in border border-amber-200 dark:border-amber-500/20">
                Showing <strong>{selectedDonutSegment}</strong> entries below.
              </div>
            )}
          </div>
        </div>

        {/* DETAILED BREAKDOWN TABLE */}
        <div className="glass-card p-0 overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex justify-between items-center border-b border-[var(--border-default)]">
            <h3 className="font-bold text-neutral-900 dark:text-white">Detailed Breakdown</h3>
            <SplitButton onExport={(format) => triggerToast('Export started', `Your ${format.toUpperCase()} file will download shortly.`, 'success')} />
          </div>
          
          <div className="divide-y divide-[var(--border-default)]">
            {groupedByMember.map(group => {
              const mem = group.member;
              const isExpanded = expandedMembersTable[mem?.id];
              const utilPct = mem ? (group.totalHours / Math.max(1, (mem.hoursWeek || 40))) * 100 : 0;
              
              return (
                <div key={mem?.id || 'unknown'} className="flex flex-col text-sm">
                  {/* Member Section Header */}
                  <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-sunken)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => toggleMemberTable(mem?.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 text-xs shrink-0">
                        {mem?.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div 
                        className="font-semibold text-neutral-900 dark:text-white hover:text-amber-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReportsMember(selectedReportsMember === mem?.id ? null : mem?.id);
                        }}
                      >
                        {mem?.name || 'Unknown Member'}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-bold text-neutral-900 dark:text-white">{group.totalHours.toFixed(1)}h</span>
                        <span className="text-[10px] text-neutral-500 uppercase">Logged</span>
                      </div>
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="font-mono text-neutral-900 dark:text-white">{utilPct.toFixed(0)}%</span>
                        <span className="text-[10px] text-neutral-500 uppercase">Utilization</span>
                      </div>
                      <div className="text-neutral-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Entries */}
                  {isExpanded && (
                    <div className="divide-y divide-[var(--border-default)]/50 bg-[var(--bg-base)]">
                      {group.logs.map(log => {
                        const proj = projects.find(p => p.id === log.projectId);
                        return (
                          <div key={log.id} className="flex items-center justify-between px-8 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj?.color || '#ccc' }}></span>
                              <span className="truncate text-neutral-900 dark:text-white font-medium">{log.task}</span>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                              <span className="text-neutral-500 hidden md:block">{log.date}</span>
                              <span className="font-mono text-neutral-500 hidden sm:block">{log.startTime}-{log.endTime}</span>
                              <TrackingSourceBadge source={log.source} />
                              <div className="flex items-center gap-2 w-16 justify-end">
                                <span className="font-mono font-semibold text-neutral-900 dark:text-white">{log.duration.toFixed(1)}h</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${log.billable ? 'bg-emerald-500' : 'bg-transparent'}`}></span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TOTALS ROW */}
          <div className="px-6 py-4 bg-amber-500/10 font-semibold flex justify-between items-center text-sm">
            <span className="text-amber-800 dark:text-amber-400 uppercase tracking-wider text-xs">Total</span>
            <div className="flex gap-8 items-center">
              <span className="font-mono text-amber-900 dark:text-amber-300">{totalHours.toFixed(1)}h</span>
              <span className="font-mono text-amber-900 dark:text-amber-300">{billableHours.toFixed(1)}h billable</span>
              <span className="font-mono text-amber-900 dark:text-amber-300">${revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE INLINE SPLIT PANEL (Member Details) */}
      {selectedReportsMember && selectedMemberData && (
        <div className="w-80 flex-shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto animate-fade-in flex flex-col z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] relative">
          <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center sticky top-0 bg-[var(--bg-surface)] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                {selectedMemberData.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white">{selectedMemberData.name}</h3>
                <p className="text-xs text-neutral-500">{selectedMemberData.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedReportsMember(null)}
              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border-default)]">
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Overview' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
              onClick={() => setActiveTab('Overview')}
            >
              Overview
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Time' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
              onClick={() => setActiveTab('Time')}
            >
              Time Breakdown
            </button>
          </div>

          <div className="p-4 flex-1">
            {activeTab === 'Overview' ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Total Filtered Hours</span>
                    <span className="font-mono font-semibold text-neutral-900 dark:text-white">{selectedMemberLogs.reduce((a,l)=>a+l.duration,0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Billable Hours</span>
                    <span className="font-mono font-semibold text-emerald-500">{selectedMemberLogs.filter(l=>l.billable).reduce((a,l)=>a+l.duration,0).toFixed(1)}h</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Capacity Utilization</h4>
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${Math.min(100, (selectedMemberLogs.reduce((a,l)=>a+l.duration,0) / (selectedMemberData.availableHoursPerWeek || 40)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Projects in Period</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(selectedMemberLogs.map(l => l.projectId))).map(pid => {
                      const proj = projects.find(p => p.id === pid);
                      const projHours = selectedMemberLogs.filter(l => l.projectId === pid).reduce((a,l)=>a+l.duration,0);
                      return (
                        <div key={pid} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj?.color || '#ccc' }}></span>
                            <span className="text-neutral-700 dark:text-neutral-300">{proj?.name || pid}</span>
                          </div>
                          <span className="font-mono text-neutral-900 dark:text-white">{projHours.toFixed(1)}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedMemberLogs.map(log => (
                  <div key={log.id} className="p-3 bg-neutral-50 dark:bg-white/5 rounded-lg border border-[var(--border-default)]">
                    <p className="font-medium text-sm text-neutral-900 dark:text-white mb-1">{log.task}</p>
                    <div className="flex justify-between items-center text-xs text-neutral-500">
                      <span>{log.date}</span>
                      <span className="font-mono">{log.duration}h</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
