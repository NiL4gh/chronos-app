/**
 * Pure helper functions extracted from MyTime.jsx.
 * No React, no state, no side effects — just date/time/color utilities.
 */

import { projects } from '../data/mockData';

// Approved project hex colors fallback
const PROJECT_COLORS = [
  '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export function getProjectColor(projectId) {
  const proj = projects.find(p => p.id === projectId);
  return proj?.color || PROJECT_COLORS[0];
}

export function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWeekNumber(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

/**
 * Parse a time string (e.g. "9:30am", "14:00") to minutes since midnight.
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const cleanStr = String(timeStr).replace(/[^0-9:]/g, '');
  let [h, m] = cleanStr.split(':').map(Number);
  if (/pm/i.test(timeStr) && h < 12) h += 12;
  if (/am/i.test(timeStr) && h === 12) h = 0;
  return (h || 0) * 60 + (m || 0);
}

/**
 * Parse a time string (e.g. "9:30am", "14:00") to fractional hours since midnight.
 * Used by CalendarView for absolute grid positioning (e.g. 14.5 for 2:30pm).
 */
export function parseHour(timeStr) {
  if (!timeStr) return 7;
  const str = String(timeStr);
  const cleanStr = str.replace(/[^0-9:]/g, '');
  const parts = cleanStr.split(':');
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  let finalH = h;
  if (/pm/i.test(str) && h < 12) finalH += 12;
  else if (/am/i.test(str) && h === 12) finalH = 0;
  return finalH + m / 60;
}

/**
 * Format hour + minute numbers to a time string (e.g. "9:30").
 */
export function formatTimeStr(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format a date to a short day label (e.g. "Mon 7").
 */
export function formatDayLabel(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}
