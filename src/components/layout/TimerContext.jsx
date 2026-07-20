import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TimerContext = createContext(null);

/**
 * useTimerState - Encapsulates all timer state management logic.
 * Handles timer tick, localStorage persistence, and Supabase logging on stop.
 * Can be called by AppShell (to own the state) or used internally by TimerProvider.
 */
export function useTimerState({ projectList, user, orgId, supabase, setLogs, triggerToast }) {
  const [timerRunning, setTimerRunning] = useState(() => {
    try { return localStorage.getItem('timer_running') === 'true'; } catch { return false; }
  });
  const [timerStart, setTimerStart] = useState(() => {
    try {
      const saved = localStorage.getItem('timer_start');
      return saved ? Number(saved) : 0;
    } catch { return 0; }
  });
  const [timerTaskLabel, setTimerTaskLabel] = useState(() => {
    try { return localStorage.getItem('timer_task') || ''; } catch { return ''; }
  });
  const [timerProjectId, setTimerProjectId] = useState(() => {
    try { return localStorage.getItem('timer_project') || ''; } catch { return ''; }
  });
  const [timerTaskId, setTimerTaskId] = useState(() => {
    try { return localStorage.getItem('timer_task_id') || ''; } catch { return ''; }
  });
  const [timerSeconds, setTimerSeconds] = useState(0);

  const timerStartRef = useRef(timerStart);
  timerStartRef.current = timerStart;

  // Tick timerSeconds every second while timer runs
  useEffect(() => {
    if (!timerRunning || !timerStartRef.current) return;
    const id = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Persist timer state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timer_running', String(timerRunning));
      localStorage.setItem('timer_start', String(timerStart));
      localStorage.setItem('timer_task', timerTaskLabel);
      localStorage.setItem('timer_project', timerProjectId);
      localStorage.setItem('timer_task_id', timerTaskId);
    } catch {}
  }, [timerRunning, timerStart, timerTaskLabel, timerProjectId, timerTaskId]);

  const startTimer = useCallback((task = '', projectId = '', taskId = '') => {
    setTimerTaskLabel(task);
    setTimerProjectId(projectId);
    setTimerTaskId(taskId);
    setTimerRunning(true);
    setTimerStart(Date.now());
  }, []);

  const updateTimer = useCallback(({ task, projectId, taskId }) => {
    if (task !== undefined) setTimerTaskLabel(task);
    if (projectId !== undefined) setTimerProjectId(projectId);
    if (taskId !== undefined) setTimerTaskId(taskId);
  }, []);

  const stopTimer = useCallback(async () => {
    setTimerRunning(false);
    if (timerStart > 0) {
      const elapsedMs = Date.now() - timerStart;
      const proj = projectList.find(p => p.id === timerProjectId) || projectList[0];
      const startStr = new Date(timerStart).toTimeString().slice(0, 5);
      const endStr = new Date().toTimeString().slice(0, 5);
      const durationHours = Number((elapsedMs / 3600000).toFixed(2)) || 0.01;

      // Optimistic local update — always visible immediately
      const newLog = {
        id: `log-${Date.now()}`,
        userId: user?.id || 'u1',
        userName: user?.email || 'You',
        projectName: proj?.name || '',
        projectId: proj?.id || '',
        task: timerTaskLabel || 'Auto Tracked Task',
        date: new Date().toISOString().slice(0, 10),
        startTime: startStr,
        endTime: endStr,
        duration: durationHours,
        source: 'auto',
        billable: true,
      };
      setLogs(prev => [newLog, ...prev]);

      // Persist to Supabase if logged in
      if (user && orgId && supabase) {
        const startedAt = new Date(timerStart).toISOString();
        const endedAt = new Date().toISOString();
        const { error } = await supabase.from('time_logs').insert({
          org_id: orgId,
          user_id: user.id,
          project_id: proj?.id || null,
          description: timerTaskLabel || 'Auto Tracked Task',
          started_at: startedAt,
          ended_at: endedAt,
          duration_hours: durationHours,
          source: 'auto',
          billable: true,
        });
        if (error) {
          console.error('[TimerProvider] stopTimer Supabase error:', error.message);
          triggerToast('Sync warning', 'Entry saved locally but not synced. Check your connection.', 'warning');
        } else {
          triggerToast('Timer saved', `Logged ${durationHours}h to ${proj?.name || 'project'}.`, 'success');
        }
      } else {
        triggerToast('Timer saved', `Logged ${durationHours}h to ${proj?.name || 'project'}.`, 'success');
      }
    }
    setTimerStart(0);
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_start');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
    } catch {}
  }, [timerStart, timerTaskLabel, timerProjectId, projectList, user, orgId, supabase, setLogs, triggerToast]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerStart(0);
    setTimerTaskLabel('');
    setTimerProjectId('');
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_start');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
    } catch {}
  }, []);

  return {
    timerRunning,
    timerStart,
    timerSeconds,
    timerTaskLabel,
    timerProjectId,
    timerTaskId,
    startTimer,
    stopTimer,
    resetTimer,
    updateTimer,
  };
}

/**
 * TimerProvider - Provides timer context to children.
 * Accepts a pre-built `value` object (from useTimerState) so the parent
 * can both consume and provide timer state without a context ordering issue.
 */
export function TimerProvider({ children, value }) {
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

/**
 * useTimer - Consumes timer state. Only re-renders when timer values change.
 * Use this instead of useOutletContext for timer-related state.
 */
export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export default TimerContext;
