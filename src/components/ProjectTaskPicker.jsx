import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';

export default function ProjectTaskPicker({
  projectId,
  taskId,
  taskText,
  onChange,
  projects,
  tasks,
  addProject,
  addTask,
}) {
  const [projectOpen, setProjectOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [taskQuery, setTaskQuery] = useState('');
  const projectRef = useRef(null);
  const taskRef = useRef(null);

  const selectedProject = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const filteredTasks = taskQuery
    ? projectTasks.filter(t => t.title.toLowerCase().includes(taskQuery.toLowerCase()))
    : projectTasks;
  const selectedTask = tasks.find(t => t.id === taskId);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (projectRef.current && !projectRef.current.contains(e.target)) {
        setProjectOpen(false);
        setCreatingProject(false);
        setNewProjectName('');
      }
      if (taskRef.current && !taskRef.current.contains(e.target)) {
        setTaskOpen(false);
        setTaskQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleProjectSelect = (proj) => {
    onChange({ projectId: proj.id, taskId: '', taskText });
    setProjectOpen(false);
    setCreatingProject(false);
    setNewProjectName('');
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const proj = addProject(newProjectName.trim());
    handleProjectSelect(proj);
  };

  const handleTaskSelect = (task) => {
    onChange({ projectId, taskId: task.id, taskText: task.title });
    setTaskOpen(false);
    setTaskQuery('');
  };

  const handleCreateTask = () => {
    if (!taskQuery.trim() || !projectId) return;
    const task = addTask(taskQuery.trim(), projectId);
    handleTaskSelect(task);
  };

  const handleTaskQueryChange = (e) => {
    setTaskQuery(e.target.value);
    onChange({ projectId, taskId: '', taskText: e.target.value });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Project picker */}
      <div ref={projectRef} className="relative">
        <button
          type="button"
          onClick={() => { setProjectOpen(v => !v); setTaskOpen(false); }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: selectedProject ? `${selectedProject.color}20` : 'var(--bg-sunken)',
            border: `1px solid ${selectedProject ? selectedProject.color + '50' : 'var(--border-default)'}`,
            color: selectedProject ? selectedProject.color : 'var(--text-muted)',
          }}
        >
          {selectedProject ? (
            <>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: selectedProject.color }}
              />
              <span className="max-w-[120px] truncate">{selectedProject.name}</span>
            </>
          ) : (
            <span>+ Project</span>
          )}
          <ChevronDown size={11} />
        </button>

        {projectOpen && (
          <div
            className="absolute top-full mt-1 left-0 z-50 rounded-xl shadow-xl w-56 overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="max-h-52 overflow-y-auto py-1">
              {projects.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProjectSelect(p)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors hover:bg-[var(--bg-sunken)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.id === projectId && <Check size={11} style={{ color: 'var(--accent)' }} />}
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border-default)' }}>
              {creatingProject ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    autoFocus
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateProject();
                      if (e.key === 'Escape') { setCreatingProject(false); setNewProjectName(''); }
                    }}
                    placeholder="Project name…"
                    className="flex-1 text-xs px-2 py-1 rounded-lg focus:outline-none"
                    style={{
                      background: 'var(--bg-sunken)',
                      border: '1px solid var(--border-focus)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    className="text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                    style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreatingProject(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-[var(--bg-sunken)]"
                  style={{ color: 'var(--accent-text)' }}
                >
                  <Plus size={12} />
                  Create new project
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task picker — only shown when a project is selected */}
      {projectId && (
        <div ref={taskRef} className="relative">
          <button
            type="button"
            onClick={() => { setTaskOpen(v => !v); setProjectOpen(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-default)',
              color: selectedTask ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            <span className="max-w-[140px] truncate">
              {selectedTask?.title || taskText || '+ Task'}
            </span>
            <ChevronDown size={11} />
          </button>

          {taskOpen && (
            <div
              className="absolute top-full mt-1 left-0 z-50 rounded-xl shadow-xl w-60 overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              <div className="px-2 pt-2">
                <input
                  autoFocus
                  type="text"
                  value={taskQuery}
                  onChange={handleTaskQueryChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const exact = filteredTasks.find(t => t.title.toLowerCase() === taskQuery.toLowerCase());
                      if (exact) handleTaskSelect(exact);
                      else if (taskQuery.trim()) handleCreateTask();
                    }
                    if (e.key === 'Escape') { setTaskOpen(false); setTaskQuery(''); }
                  }}
                  placeholder="Search or create task…"
                  className="w-full text-xs px-2 py-1.5 rounded-lg focus:outline-none mb-1"
                  style={{
                    background: 'var(--bg-sunken)',
                    border: '1px solid var(--border-focus)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {filteredTasks.length > 0 ? filteredTasks.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTaskSelect(t)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-[var(--bg-sunken)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span className="flex-1 truncate">{t.title}</span>
                    {t.id === taskId && <Check size={11} style={{ color: 'var(--accent)' }} />}
                  </button>
                )) : (
                  <p className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {taskQuery ? '' : 'No tasks in this project'}
                  </p>
                )}
                {taskQuery.trim() && !filteredTasks.find(t => t.title.toLowerCase() === taskQuery.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={handleCreateTask}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-[var(--bg-sunken)]"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <Plus size={12} />
                    Create "{taskQuery}"
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
