import React, { useState, useMemo } from 'react';
import { 
  Download, Filter, TrendingUp, Clock, DollarSign, Users, 
  ChevronDown, ChevronUp, X, CheckCircle2, FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import SplitButton from '../components/ui/SplitButton';
import Badge from '../components/ui/Badge';
import Input, { Select } from '../components/ui/Input';
import DateTimePicker from '../components/ui/DateTimePicker';
import { useOutletContext } from 'react-router-dom';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import EmptyState from '../components/ui/EmptyState';

import { teamMembers, projects, timeLogs, billingRates } from '../data/mockData';

export default function Reports() {
  const { triggerToast, role, logs } = useOutletContext();
  
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

  // Options — sentinel value is 'all' to match filter logic
  const memberOptions = [{ value: 'all', label: 'All Members' }, ...teamMembers.map(m => ({ value: m.id, label: m.name }))];
  const projectOptions = [{ value: 'all', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.name }))];

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (log.date < filterStart || log.date > filterEnd) return false;
      if (filterMember !== 'all' && log.userId !== filterMember) return false;
      if (filterProject !== 'all' && log.projectId !== filterProject) return false;
      return true;
    });
  }, [logs, filterStart, filterEnd, filterMember, filterProject]);

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

  const handleExportCSV = () => {
    const headers = ['Date', 'Member', 'Project', 'Task', 'Duration (h)',
      'Billable', 'Source'];
    const rows = filteredLogs.map(log => [
      log.date,
      log.userName,
      log.projectName,
      log.task,
      log.duration,
      log.billable ? 'Yes' : 'No',
      log.source
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell =>
        `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateRange = `${filterStart}_to_${filterEnd}`;
    link.download = `chronos-report-${dateRange}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const totalHours = filteredLogs.reduce((s, l) => s + l.duration, 0)
      .toFixed(1);
    const billableHours = filteredLogs
      .filter(l => l.billable)
      .reduce((s, l) => s + l.duration, 0)
      .toFixed(1);
    const revenue = (parseFloat(billableHours) * (billingRates?.default || 95)).toFixed(0);
    const activeMembers = [...new Set(filteredLogs.map(l =>
      l.userName))].length;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Chronos Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter',
              sans-serif;
            color: #1c1917;
            padding: 40px;
            font-size: 13px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1c1917;
          }
          .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .meta { text-align: right; color: #78716c; font-size: 12px;
            line-height: 1.6; }
          .metrics {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .metric-card {
            padding: 16px;
            border: 1px solid #e8e3dc;
            border-radius: 8px;
          }
          .metric-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #78716c;
            margin-bottom: 6px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: 800;
            color: #1c1917;
          }
          .section-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #78716c;
            margin-bottom: 12px;
            margin-top: 28px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #78716c;
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e8e3dc;
            background: #faf9f7;
          }
          td {
            padding: 9px 12px;
            border-bottom: 1px solid #f0ede8;
            color: #1c1917;
            font-size: 12px;
          }
          tr:last-child td { border-bottom: none; }
          .billable-yes {
            color: #166534;
            font-weight: 600;
          }
          .billable-no { color: #78716c; }
          .source-auto {
            color: #166534;
            font-size: 11px;
          }
          .source-manual {
            color: #92400e;
            font-size: 11px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e8e3dc;
            font-size: 11px;
            color: #a8a29e;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 24px; }
            @page { margin: 16mm; size: A4; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Chronos</div>
            <div style="color:#78716c;font-size:12px;margin-top:4px">
              Time Report
            </div>
          </div>
          <div class="meta">
            <div><strong>Period:</strong> ${filterStart} — ${filterEnd}</div>
            <div><strong>Generated:</strong>
              ${new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-label">Total Hours</div>
            <div class="metric-value">${totalHours}h</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Billable Hours</div>
            <div class="metric-value">${billableHours}h</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Est. Revenue</div>
            <div class="metric-value">$${parseInt(revenue)
              .toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Active Members</div>
            <div class="metric-value">${activeMembers}</div>
          </div>
        </div>

        <div class="section-title">Time Log Detail</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Project</th>
              <th>Task</th>
              <th>Hours</th>
              <th>Billable</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => `
              <tr>
                <td>${log.date}</td>
                <td>${log.userName}</td>
                <td>${log.projectName}</td>
                <td>${log.task}</td>
                <td>${log.duration}h</td>
                <td class="${log.billable ? 'billable-yes' : 'billable-no'}">
                  ${log.billable ? 'Yes' : 'No'}
                </td>
                <td class="source-${log.source}">${log.source}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <span>Chronos — Time Intelligence Platform</span>
          <span>Confidential</span>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank',
      'width=900,height=700,scrollbars=yes');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const selectedMemberData = selectedReportsMember ? teamMembers.find(m => m.id === selectedReportsMember) : null;
  const selectedMemberLogs = selectedMemberData ? filteredLogs.filter(l => l.userId === selectedMemberData.id) : [];

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 animate-fade-in relative z-10" style={{ background: 'transparent' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Reports</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Analyse team performance and export time data.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="glass-card p-4 relative z-30">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">From</label>
              <DateTimePicker value={filterStart} onChange={setFilterStart} placeholder="From date" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">To</label>
              <DateTimePicker value={filterEnd} onChange={setFilterEnd} placeholder="To date" />
            </div>
            
            <div className="w-px h-8 bg-[var(--border-default)] hidden md:block mb-1" />
            
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Member</label>
              <Select value={filterMember} onChange={e => setFilterMember(e.target.value)}>
                {memberOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Project</label>
              <Select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                {projectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </Select>
            </div>
            
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <button 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[var(--border-default)] hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all duration-150 flex-shrink-0"
                onClick={handleExportCSV}
              >
                <Download size={14} /> CSV
              </button>
              <button 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--text-active)] hover:bg-neutral-800 text-white text-sm font-medium transition-all duration-150 flex-shrink-0"
                onClick={handleExportPDF}
              >
                <FileText size={14} /> Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'total', label: 'Total Hours', val: totalHours.toFixed(1), icon: Clock },
            { id: 'billable', label: 'Billable Hours', val: billableHours.toFixed(1), icon: TrendingUp },
            { id: 'rev', label: 'Est. Revenue', val: '$' + revenue.toLocaleString(), icon: DollarSign },
            { id: 'active', label: 'Active Members', val: activeMembersCount, icon: Users },
          ].map(metric => (
            <div 
              key={metric.id} 
              className="glass-interactive p-5 cursor-pointer relative"
              onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
            >
              <div className="flex items-center gap-2 mb-4">
                <metric.icon size={16} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight font-sans">{metric.val}</p>
            </div>
          ))}
        </div>
        
        {/* INLINE METRIC EXPANSION */}
        {expandedMetric && (
          <div className="glass-card p-4 animate-fade-in -mt-2">
            <p className="text-sm text-[var(--text-secondary)]">
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
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-6">Daily Hours</h3>
            
            <div className="flex-1 flex items-end gap-2 h-48 border-b border-[var(--border-default)] pb-2 relative">
              {dailyData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-secondary)]">No data for selected period</div>
              ) : dailyData.map((d, i) => (
                <div 
                  key={d.date}
                  className="flex-1 flex flex-col justify-end items-center group cursor-pointer h-full relative"
                  onClick={() => setSelectedChartDate(selectedChartDate === d.date ? null : d.date)}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-[var(--text-primary)] dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none">
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
                  <div className="mt-3 text-[10px] text-[var(--text-secondary)] opacity-70 group-hover:opacity-100 truncate w-full text-center">
                    {d.date.substring(5)}
                  </div>
                </div>
              ))}
            </div>

            {/* INLINE DAY DETAIL PANEL */}
            {selectedChartDate && (
              <div className="mt-6 p-4 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-default)] animate-fade-in glass-elevated">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">Activity for {selectedChartDate}</h3>
                  <button onClick={() => setSelectedChartDate(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredLogs.filter(l => l.date === selectedChartDate).map(log => {
                    const proj = projects.find(p => p.id === log.projectId);
                    const mem = teamMembers.find(m => m.id === log.userId);
                    return (
                      <div key={log.id} className="flex justify-between items-center text-sm p-2 bg-[var(--bg-surface)] rounded-md border border-[var(--border-default)]">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[var(--border-default)] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {mem?.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                              {log.task}
                              {log.billable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj?.color || '#ccc' }}></span>
                              {proj?.name || log.projectName} • {mem?.name || log.userName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <TrackingSourceBadge source={log.source} />
                          <span className="font-mono font-semibold text-[var(--text-primary)]">{log.duration.toFixed(1)}h</span>
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
            <h3 className="text-base font-medium text-[var(--text-primary)] w-full text-left mb-6">Billable Split</h3>
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
                <span className="text-2xl font-mono font-black text-[var(--text-primary)]">{billablePct}%</span>
                <span className="text-xs text-[var(--text-secondary)]">billable</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <div 
                className={`flex items-center justify-between cursor-pointer p-1 rounded hover:bg-[var(--bg-sunken)] ${selectedDonutSegment === 'billable' ? 'bg-black/5 dark:bg-white/5 font-semibold' : ''}`}
                onClick={() => setSelectedDonutSegment(s => s === 'billable' ? null : 'billable')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-sm text-[var(--text-secondary)]">Billable</span>
                </div>
                <span className="text-sm font-mono text-[var(--text-primary)]">{billableHours.toFixed(1)}h</span>
              </div>
              <div 
                className={`flex items-center justify-between cursor-pointer p-1 rounded hover:bg-[var(--bg-sunken)] ${selectedDonutSegment === 'non-billable' ? 'bg-black/5 dark:bg-white/5 font-semibold' : ''}`}
                onClick={() => setSelectedDonutSegment(s => s === 'non-billable' ? null : 'non-billable')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#d4cdc4]" />
                  <span className="text-sm text-[var(--text-secondary)]">Internal</span>
                </div>
                <span className="text-sm font-mono text-[var(--text-primary)]">{nonBillableHours.toFixed(1)}h</span>
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
        <div className="mt-6 border-t border-[var(--border-default)] pt-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Detailed Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto w-full">
            <div className="divide-y divide-[var(--border-default)] min-w-[800px]">
              {groupedByMember.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={Filter}
                  title="No data matches your filters"
                  description="Try adjusting the date range, member, or project filters above to see results."
                />
              </div>
            ) : groupedByMember.map(group => {
              const mem = group.member;
              const isExpanded = expandedMembersTable[mem?.id];
              const utilPct = mem ? (group.totalHours / Math.max(1, (mem.hoursWeek || 40))) * 100 : 0;
              
              return (
                <div key={mem?.id || 'unknown'} className="flex flex-col text-sm">
                  {/* Member Section Header */}
                  <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-sunken)] hover:bg-[var(--bg-sunken)] transition-colors cursor-pointer group" onClick={() => toggleMemberTable(mem?.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-secondary)] text-xs shrink-0">
                        {mem?.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div 
                        className="font-semibold text-[var(--text-primary)] hover:text-amber-500 transition-colors"
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
                        <span className="font-mono font-bold text-[var(--text-primary)]">{group.totalHours.toFixed(1)}h</span>
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase">Logged</span>
                      </div>
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="font-mono text-[var(--text-primary)]">{utilPct.toFixed(0)}%</span>
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase">Utilization</span>
                      </div>
                      <div className="text-[var(--text-muted)]">
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
                          <div key={log.id} className="flex items-center justify-between px-8 py-3 hover:bg-[var(--bg-sunken)] transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj?.color || '#ccc' }}></span>
                              <span className="truncate text-[var(--text-primary)] font-medium">{log.task}</span>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                              <span className="text-[var(--text-secondary)] hidden md:block">{log.date}</span>
                              <span className="font-mono text-[var(--text-secondary)] hidden sm:block">{log.startTime}-{log.endTime}</span>
                              <TrackingSourceBadge source={log.source} />
                              <div className="flex items-center gap-2 w-16 justify-end">
                                <span className="font-mono font-semibold text-[var(--text-primary)]">{log.duration.toFixed(1)}h</span>
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
          </div>

          {/* TOTALS ROW */}
          <div className="px-6 py-4 bg-amber-500/10 font-semibold flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-sm gap-4 sm:gap-0">
            <span className="text-amber-800 dark:text-amber-400 uppercase tracking-wider text-xs">Total</span>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start sm:items-center">
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
              <div className="w-10 h-10 rounded-full bg-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-secondary)] shrink-0">
                {selectedMemberData.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">{selectedMemberData.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{selectedMemberData.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedReportsMember(null)}
              className="p-1.5 rounded-full hover:bg-[var(--border-default)] dark:hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border-default)]">
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Overview' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-[var(--text-secondary)] hover:text-neutral-800 dark:hover:text-neutral-200'}`}
              onClick={() => setActiveTab('Overview')}
            >
              Overview
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Time' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-[var(--text-secondary)] hover:text-neutral-800 dark:hover:text-neutral-200'}`}
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
                    <span className="text-[var(--text-secondary)]">Total Filtered Hours</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">{selectedMemberLogs.reduce((a,l)=>a+l.duration,0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Billable Hours</span>
                    <span className="font-mono font-semibold text-emerald-500">{selectedMemberLogs.filter(l=>l.billable).reduce((a,l)=>a+l.duration,0).toFixed(1)}h</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Capacity Utilization</h4>
                  <div className="w-full h-2 rounded-full bg-[var(--border-default)] overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${Math.min(100, (selectedMemberLogs.reduce((a,l)=>a+l.duration,0) / (selectedMemberData.availableHoursPerWeek || 40)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Projects in Period</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(selectedMemberLogs.map(l => l.projectId))).map(pid => {
                      const proj = projects.find(p => p.id === pid);
                      const projHours = selectedMemberLogs.filter(l => l.projectId === pid).reduce((a,l)=>a+l.duration,0);
                      return (
                        <div key={pid} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj?.color || '#ccc' }}></span>
                            <span className="text-[var(--text-secondary)]">{proj?.name || pid}</span>
                          </div>
                          <span className="font-mono text-[var(--text-primary)]">{projHours.toFixed(1)}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedMemberLogs.map(log => (
                  <div key={log.id} className="p-3 bg-[var(--bg-sunken)] rounded-lg border border-[var(--border-default)]">
                    <p className="font-medium text-sm text-[var(--text-primary)] mb-1">{log.task}</p>
                    <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
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
