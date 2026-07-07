import React, { useState, useMemo } from 'react';
import {
  Download, Filter, TrendingUp, Clock,
  X, CheckCircle2, FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import DateTimePicker from '../components/ui/DateTimePicker';
import { useOutletContext } from 'react-router-dom';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import { teamMembers, projects, billingRates } from '../data/mockData';

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
  const [filterProject, setFilterProject] = useState('all');

  // Interactive States
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [selectedChartDate, setSelectedChartDate] = useState(null);
  const [selectedDonutSegment, setSelectedDonutSegment] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Options
  const projectOptions = [{ value: 'all', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.name }))];

  // Filtered Logs — current user only
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (log.userId !== 'u1') return false;
      if ((filterStart && log.date < filterStart) || (filterEnd && log.date > filterEnd)) return false;
      if (filterProject !== 'all' && log.projectId !== filterProject) return false;
      return true;
    });
  }, [logs, filterStart, filterEnd, filterProject]);

  // Metrics
  const totalHours = filteredLogs.reduce((acc, log) => acc + log.duration, 0);
  const billableLogs = filteredLogs.filter(log => log.billable);
  const billableHours = billableLogs.reduce((acc, log) => acc + log.duration, 0);
  const revenue = billableHours * (billingRates?.default || 95);
  const myEntriesCount = filteredLogs.length;

  // Tag Aggregation — hours per tag from filtered logs
  const tagData = useMemo(() => {
    const tagMap = {};
    filteredLogs.forEach(log => {
      const proj = projects.find(p => p.id === log.projectId);
      const tags = proj?.tags || [];
      if (tags.length === 0) {
        // Untagged
        if (!tagMap['untagged']) tagMap['untagged'] = { hours: 0, entries: 0, projects: new Set() };
        tagMap['untagged'].hours += log.duration;
        tagMap['untagged'].entries += 1;
        tagMap['untagged'].projects.add(log.projectId);
      } else {
        tags.forEach(tag => {
          if (!tagMap[tag]) tagMap[tag] = { hours: 0, entries: 0, projects: new Set() };
          tagMap[tag].hours += log.duration;
          tagMap[tag].entries += 1;
          tagMap[tag].projects.add(log.projectId);
        });
      }
    });
    return Object.entries(tagMap)
      .map(([tag, data]) => ({
        tag,
        hours: Math.round(data.hours * 10) / 10,
        entries: data.entries,
        projectCount: data.projects.size,
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredLogs]);

  const maxTagHours = Math.max(...tagData.map(t => t.hours), 1);

  // Bar Chart Data (Daily Hours)
  const dailyData = useMemo(() => {
    const map = {};
    // ensure all dates in range are represented or just ones with data?
    // the prompt says "One bar per day in filteredLogs date range. Max 14 bars."
    filteredLogs.forEach(log => {
      if (!map[log.date]) map[log.date] = { hours: 0, entries: 0 };
      map[log.date].hours += log.duration;
      map[log.date].entries += 1;
    });
    let sortedDates = Object.keys(map).sort();
    if (sortedDates.length > 14) sortedDates = sortedDates.slice(-14);
    return sortedDates.map(date => ({
      date,
      hours: map[date].hours,
      entries: map[date].entries,
    }));
  }, [filteredLogs]);

  const maxDaily = Math.max(...dailyData.map(d => d.hours), 1);

  // Donut Chart Data
  const nonBillableHours = totalHours - billableHours;
  const billablePct = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const billableDashoffset = circumference * (1 - billablePct / 100);

  const groupedByProject = useMemo(() => {
    const map = {};
    filteredLogs.forEach(log => {
      if (!map[log.projectId]) {
        const proj = projects.find(p => p.id === log.projectId);
        map[log.projectId] = {
          name: log.projectName || proj?.name || 'Unknown',
          color: proj?.color || 'var(--accent)',
          totalHours: 0,
          billableHours: 0,
          entryCount: 0,
        };
      }
      map[log.projectId].totalHours += log.duration;
      if (log.billable) map[log.projectId].billableHours += log.duration;
      map[log.projectId].entryCount += 1;
    });
    return Object.values(map).sort((a, b) => b.totalHours - a.totalHours);
  }, [filteredLogs]);

  const handleExportCSV = () => {
    const rate = billingRates?.default || 95;
    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'Date', 'Project', 'Task', 'Start Time', 'End Time',
      'Duration (h)', 'Billable', 'Rate (USD/h)', 'Amount (USD)', 'Type'
    ];

    const rows = filteredLogs.map(log => {
      const amount = log.billable ? (log.duration * rate).toFixed(2) : '0.00';
      return [
        log.date,
        log.projectName,
        log.task,
        log.startTime || '',
        log.endTime || '',
        Number(log.duration).toFixed(2),
        log.billable ? 'Yes' : 'No',
        log.billable ? rate.toFixed(2) : '0.00',
        amount,
        log.source === 'manual' ? 'Manual' : 'Timer',
      ];
    });

    const totalHrs = filteredLogs.reduce((s, l) => s + l.duration, 0);
    const totalBillableHrs = filteredLogs.filter(l => l.billable).reduce((s, l) => s + l.duration, 0);
    const totalAmount = (totalBillableHrs * rate).toFixed(2);

    const summaryRows = [
      [],
      ['SUMMARY'],
      ['Period', `${filterStart} to ${filterEnd}`],
      ['Total Hours', totalHrs.toFixed(2)],
      ['Billable Hours', totalBillableHrs.toFixed(2)],
      ['Total Amount (USD)', `$${totalAmount}`],
      ['Generated', new Date().toISOString()],
      ['Source', 'Chronos Time Tracker'],
    ];

    const allRows = [headers, ...rows, ...summaryRows];
    const csvBody = allRows
      .map(row => (row.length === 0 ? '' : row.map(escape).join(',')))
      .join('\r\n');

    // UTF-8 BOM so Excel opens correctly
    const BOM = '﻿';
    const blob = new Blob([BOM + csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronos-time-report_${filterStart}_${filterEnd}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const rate = billingRates?.default || 95;
    const pdfTotalHours = filteredLogs.reduce((s, l) => s + l.duration, 0);
    const pdfBillableHours = filteredLogs.filter(l => l.billable).reduce((s, l) => s + l.duration, 0);
    const pdfRevenue = (pdfBillableHours * rate).toFixed(2);
    const pdfEntries = filteredLogs.length;
    const generatedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const groupedByProject = {};
    filteredLogs.forEach(log => {
      if (!groupedByProject[log.projectName]) groupedByProject[log.projectName] = { hours: 0, billable: 0 };
      groupedByProject[log.projectName].hours += log.duration;
      if (log.billable) groupedByProject[log.projectName].billable += log.duration;
    });

    const printContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chronos Time Report — ${filterStart} to ${filterEnd}</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
      color: #111827;
      background: #fff;
      font-size: 12px;
      line-height: 1.5;
    }
    .page { padding: 40px 48px; max-width: 900px; margin: 0 auto; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #111827; margin-bottom: 32px; }
    .brand { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #111827; }
    .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
    .meta-block { text-align: right; color: #6b7280; font-size: 11px; line-height: 1.8; }
    .meta-block strong { color: #111827; }

    /* Metrics */
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 36px; }
    .metric { padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
    .metric-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 6px; }
    .metric-value { font-size: 22px; font-weight: 800; color: #111827; font-variant-numeric: tabular-nums; }
    .metric-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }

    /* Section */
    .section-header { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }

    /* Project summary */
    .project-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .project-table th { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; padding: 6px 10px; text-align: left; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; }
    .project-table td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #374151; }
    .project-table tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .mono { font-variant-numeric: tabular-nums; font-weight: 600; }

    /* Detail table */
    .detail-table { width: 100%; border-collapse: collapse; }
    .detail-table th { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; padding: 7px 10px; text-align: left; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; }
    .detail-table td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #374151; vertical-align: top; }
    .detail-table tr:nth-child(even) td { background: #f9fafb; }
    .detail-table tr:last-child td { border-bottom: none; }
    .billable-badge { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 9px; font-weight: 700; }
    .billable-yes { background: #d1fae5; color: #065f46; }
    .billable-no  { background: #f3f4f6; color: #9ca3af; }
    .source-badge { font-size: 9px; color: #6b7280; text-transform: capitalize; }
    .amount { font-variant-numeric: tabular-nums; font-weight: 600; color: #111827; }

    /* Totals row */
    .totals-row td { background: #f3f4f6 !important; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb; }

    /* Footer */
    .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }

    @media print {
      body { font-size: 11px; }
      .page { padding: 0; }
      @page { margin: 15mm 18mm; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="brand">Chronos</div>
      <div class="brand-sub">Time Report</div>
    </div>
    <div class="meta-block">
      <div><strong>Period:</strong> ${filterStart} &ndash; ${filterEnd}</div>
      <div><strong>Generated:</strong> ${generatedAt}</div>
      <div><strong>Entries:</strong> ${pdfEntries}</div>
    </div>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Total Hours</div>
      <div class="metric-value">${pdfTotalHours.toFixed(1)}</div>
      <div class="metric-sub">logged</div>
    </div>
    <div class="metric">
      <div class="metric-label">Billable Hours</div>
      <div class="metric-value">${pdfBillableHours.toFixed(1)}</div>
      <div class="metric-sub">${pdfTotalHours > 0 ? Math.round((pdfBillableHours / pdfTotalHours) * 100) : 0}% of total</div>
    </div>
    <div class="metric">
      <div class="metric-label">Non-Billable</div>
      <div class="metric-value">${(pdfTotalHours - pdfBillableHours).toFixed(1)}</div>
      <div class="metric-sub">hours</div>
    </div>
    <div class="metric">
      <div class="metric-label">Revenue</div>
      <div class="metric-value">$${Number(pdfRevenue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
      <div class="metric-sub">@ $${rate}/h</div>
    </div>
  </div>

  <div class="section-header">By Project</div>
  <table class="project-table">
    <thead>
      <tr>
        <th>Project</th>
        <th class="text-right">Total Hours</th>
        <th class="text-right">Billable Hours</th>
        <th class="text-right">Amount (USD)</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(groupedByProject).sort((a, b) => b[1].hours - a[1].hours).map(([name, data]) => `
      <tr>
        <td>${name}</td>
        <td class="text-right mono">${data.hours.toFixed(2)}h</td>
        <td class="text-right mono">${data.billable.toFixed(2)}h</td>
        <td class="text-right mono">$${(data.billable * rate).toFixed(2)}</td>
      </tr>`).join('')}
      <tr class="totals-row">
        <td>Total</td>
        <td class="text-right mono">${pdfTotalHours.toFixed(2)}h</td>
        <td class="text-right mono">${pdfBillableHours.toFixed(2)}h</td>
        <td class="text-right mono">$${pdfRevenue}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-header">Time Log Detail</div>
  <table class="detail-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Project</th>
        <th>Task</th>
        <th>Start</th>
        <th>End</th>
        <th class="text-right">Hours</th>
        <th>Billable</th>
        <th class="text-right">Amount</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      ${filteredLogs.map(log => `
      <tr>
        <td>${log.date}</td>
        <td>${log.projectName}</td>
        <td>${log.task || '—'}</td>
        <td>${log.startTime || '—'}</td>
        <td>${log.endTime || '—'}</td>
        <td class="text-right mono">${Number(log.duration).toFixed(2)}h</td>
        <td><span class="billable-badge ${log.billable ? 'billable-yes' : 'billable-no'}">${log.billable ? 'Billable' : 'Non-bill.'}</span></td>
        <td class="text-right amount">${log.billable ? '$' + (log.duration * rate).toFixed(2) : '—'}</td>
        <td class="source-badge">${log.source === 'manual' ? 'Manual' : 'Timer'}</td>
      </tr>`).join('')}
      <tr class="totals-row">
        <td colspan="5">Total</td>
        <td class="text-right mono">${pdfTotalHours.toFixed(2)}h</td>
        <td></td>
        <td class="text-right mono">$${pdfRevenue}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Chronos &mdash; Time Intelligence Platform &mdash; Confidential</span>
    <span>Generated ${generatedAt}</span>
  </div>

</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=960,height=750,scrollbars=yes');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 animate-fade-in relative z-10" style={{ background: 'transparent' }}>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Reports</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Analyse your tracked hours and export time data.
          </p>
        </div>

        {/* Secondary tab nav */}
        <div
          className="flex items-center gap-1 border-b -mx-4 md:-mx-6 px-4 md:px-6"
          style={{ borderColor: 'var(--border-default)' }}
        >
          {['Overview', 'Time tags'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{ color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {tab}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-sm"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && <>

        {/* FILTER BAR */}
        <div className="glass-card p-4 relative z-30">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Date Range</label>
              <DateTimePicker
                range={true}
                rangeValue={[filterStart, filterEnd]}
                onRangeChange={([start, end]) => {
                  setFilterStart(start || '');
                  setFilterEnd(end || '');
                }}
                showPresets={true}
              />
            </div>
            
            <div className="w-px h-8 bg-[var(--border-default)] hidden md:block mb-1" />

            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Project</label>
              <Select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                {projectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </Select>
            </div>
            
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <button 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all duration-150 flex-shrink-0"
                style={{ background: 'var(--bg-surface)' }}
                onClick={handleExportCSV}
              >
                <Download size={14} /> CSV
              </button>
              <button 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex-shrink-0"
                style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
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
            { id: 'entries', label: 'My Entries', val: myEntriesCount, icon: CheckCircle2 },
          ].map(metric => (
            <div 
              key={metric.id} 
              className="glass-card py-4 px-5 flex flex-col justify-center min-h-[96px] glass-interactive lift-on-hover cursor-pointer relative transition-all"
              onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <metric.icon size={14} className="text-[var(--text-muted)]" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{metric.label}</p>
                </div>
                <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{metric.val}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* INLINE METRIC EXPANSION */}
        {expandedMetric && (
          <div className="glass-card p-4 animate-fade-in -mt-2">
            <p className="text-sm text-[var(--text-secondary)]">
              {expandedMetric === 'total' && "Total hours logged across all applied filters in the specified period."}
              {expandedMetric === 'billable' && `This represents ${billablePct}% of total logged time.`}
              {expandedMetric === 'entries' && "Number of individual time entries matching the current filters."}
            </p>
          </div>
        )}

        {/* TWO COLUMN CHART ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BAR CHART */}
          <div className="glass-card lg:col-span-2 p-6 flex flex-col relative">
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-6">Daily Hours</h3>
            
            <div className="flex items-end gap-2 h-48 border-b border-[var(--border-default)] pb-2 relative">
              {dailyData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-secondary)]">No data for selected period</div>
              ) : dailyData.map((d, i) => (
                <div 
                  key={d.date}
                  className="flex-1 flex flex-col justify-end items-center group cursor-pointer h-full relative"
                  onClick={() => setSelectedChartDate(selectedChartDate === d.date ? null : d.date)}
                >
                  {/* Tooltip */}
                  <div
                    className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none"
                    style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)' }}
                  >
                    {d.date} — {d.hours.toFixed(1)}h across {d.entries} {d.entries === 1 ? 'entry' : 'entries'}
                  </div>
                  
                  {/* Bar */}
                  <div
                    className="w-full max-w-[40px] rounded-t-sm transition-all duration-300 animate-bar-grow"
                    style={{
                      height: `${(d.hours / maxDaily) * 100}%`,
                      animationDelay: `${i * 40}ms`,
                      background: selectedChartDate === d.date
                        ? 'var(--accent)'
                        : 'color-mix(in srgb, var(--accent) 75%, transparent)'
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
                            {(mem?.name || log.userName || 'U').split(' ').map(n=>n[0]).join('')}
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
                  stroke="var(--border-strong)"
                  strokeWidth={selectedDonutSegment === 'non-billable' ? "14" : "12"}
                  className={`cursor-pointer transition-all duration-300 ${selectedDonutSegment === 'billable' ? 'opacity-30' : ''}`}
                  onClick={() => setSelectedDonutSegment(s => s === 'non-billable' ? null : 'non-billable')}
                />
                {/* Billable Segment */}
                <circle
                  cx="50" cy="50" r={radius} fill="none"
                  stroke="var(--accent)"
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
                  <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />
                  <span className="text-sm text-[var(--text-secondary)]">Billable</span>
                </div>
                <span className="text-sm font-mono text-[var(--text-primary)]">{billableHours.toFixed(1)}h</span>
              </div>
              <div 
                className={`flex items-center justify-between cursor-pointer p-1 rounded hover:bg-[var(--bg-sunken)] ${selectedDonutSegment === 'non-billable' ? 'bg-black/5 dark:bg-white/5 font-semibold' : ''}`}
                onClick={() => setSelectedDonutSegment(s => s === 'non-billable' ? null : 'non-billable')}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: 'var(--border-strong)' }} />
                  <span className="text-sm text-[var(--text-secondary)]">Internal</span>
                </div>
                <span className="text-sm font-mono text-[var(--text-primary)]">{nonBillableHours.toFixed(1)}h</span>
              </div>
            </div>

            {selectedDonutSegment && (
              <div className="mt-4 w-full p-2 text-center text-xs rounded animate-fade-in border" style={{ color: 'var(--accent-text)', background: 'var(--accent-subtle)', borderColor: 'var(--accent-border)' }}>
                Showing <strong>{selectedDonutSegment}</strong> entries below.
              </div>
            )}
          </div>
        </div>

        {/* PROJECT BREAKDOWN TABLE */}
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>By Project</h3>
          </div>
          {groupedByProject.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No project data for selected period.
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                  {['PROJECT', 'TRACKED', 'BILLABLE', 'ENTRIES', 'BILLABLE %'].map(col => (
                    <th
                      key={col}
                      className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedByProject.map(({ name, color, totalHours: projHours, billableHours: projBillable, entryCount }) => {
                  const billablePct = projHours > 0 ? Math.round((projBillable / projHours) * 100) : 0;
                  return (
                    <tr
                      key={name}
                      className="border-b transition-colors"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                        {projHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {projBillable.toFixed(1)}h
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {entryCount}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${billablePct}%`, background: 'var(--accent)' }}
                            />
                          </div>
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {billablePct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        </>}

        {activeTab === 'Time tags' && (
          <div className="space-y-6 animate-fade-in mt-6">
            {/* Filter bar (same as Overview) */}
            <div className="glass-card p-4 relative z-30">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Date Range</label>
                  <DateTimePicker
                    range={true}
                    rangeValue={[filterStart, filterEnd]}
                    onRangeChange={([start, end]) => {
                      setFilterStart(start || '');
                      setFilterEnd(end || '');
                    }}
                    showPresets={true}
                  />
                </div>
                <div className="w-px h-8 bg-[var(--border-default)] hidden md:block mb-1" />
                <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                  <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Project</label>
                  <Select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                    {projectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </Select>
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Tags', value: tagData.length },
                { label: 'Total Hours', value: totalHours.toFixed(1) },
                { label: 'Entries', value: myEntriesCount },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Hours by Tag</h3>
              {tagData.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No data for the selected filters.</p>
              ) : (
                <div className="space-y-3">
                  {tagData.map(({ tag, hours, entries, projectCount }) => (
                    <div key={tag} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-20 text-right truncate" style={{ color: 'var(--text-secondary)' }}>
                        {tag === 'untagged' ? 'Untagged' : tag}
                      </span>
                      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
                        <div
                          className="h-full rounded-lg transition-all duration-500"
                          style={{
                            width: `${(hours / maxTagHours) * 100}%`,
                            minWidth: hours > 0 ? '8px' : '0',
                            background: 'var(--accent)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono w-12 text-right" style={{ color: 'var(--text-primary)' }}>
                        {hours}h
                      </span>
                      <span className="text-[10px] w-16 text-right" style={{ color: 'var(--text-muted)' }}>
                        {entries} entries · {projectCount} proj{projectCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tag details table */}
            {tagData.length > 0 && (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Tag</th>
                      <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Hours</th>
                      <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Entries</th>
                      <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Projects</th>
                      <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagData.map(({ tag, hours, entries, projectCount }) => (
                      <tr key={tag} className="border-b last:border-0 hover:bg-[var(--bg-sunken)] transition-colors">
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {tag === 'untagged' ? 'Untagged' : tag}
                        </td>
                        <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--text-primary)' }}>{hours}h</td>
                        <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{entries}</td>
                        <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{projectCount}</td>
                        <td className="px-4 py-3 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
