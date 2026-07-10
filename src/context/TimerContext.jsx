import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TimerContext = createContext(null);

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return ctx;
}

export function TimerProvider({ children }) {
  // Timer state — persisted to localStorage
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

  // Tick timerSeconds every second while timer runs
  useEffect(() => {
    if (!timerRunning || !timerStart) return;
    const id = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStart) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerStart]);

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

  // Electron global hotkey listener
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const handleShortcut = (e, arg) => {
          if (arg === 'toggle-timer') {
            if (timerRunning) stopTimer();
            else startTimer();
          }
        };
        ipcRenderer.on('global-shortcut', handleShortcut);
        return () => {
          ipcRenderer.removeListener('global-shortcut', handleShortcut);
        };
      } catch (err) {
        console.error(err);
      }
    }
  }, [timerRunning]);

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

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerStart(0);
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_start');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
    } catch {}
  }, []);

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

  const value = {
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

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}