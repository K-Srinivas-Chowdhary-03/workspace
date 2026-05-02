import { useState } from 'react';
import TaskCard from './TaskCard';
import { FaPlus, FaLayerGroup, FaPlay, FaSearch, FaCheckDouble } from 'react-icons/fa';

const COLUMNS = [
  {
    key: 'backlog',
    label: 'Backlog',
    icon: <FaLayerGroup />,
    accent: '#a78bfa',
    bg: 'rgba(167,139,250,0.06)',
  },
  {
    key: 'in-progress',
    label: 'In Progress',
    icon: <FaPlay />,
    accent: '#4fc3f7',
    bg: 'rgba(79,195,247,0.06)',
  },
  {
    key: 'review',
    label: 'Under Review',
    icon: <FaSearch />,
    accent: '#fbbf24',
    bg: 'rgba(251,191,36,0.06)',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: <FaCheckDouble />,
    accent: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
  },
];

const KanbanBoard = ({ tasks, onTaskClick, onAddTask, onStatusChange, isAdmin }) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e, col) => { e.preventDefault(); setDragOverCol(col); };
  const handleDrop = (e, col) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== col) {
      onStatusChange(draggedTask._id, col);
    }
    setDraggedTask(null);
    setDragOverCol(null);
  };

  return (
    <div className="row g-3">
      {COLUMNS.map((col) => (
        <div key={col.key} className="col-12 col-md-6 col-xl-3">
          <div
            style={{
              background: dragOverCol === col.key
                ? `rgba(255,255,255,0.08)`
                : col.bg,
              borderRadius: '16px',
              border: `1px solid ${dragOverCol === col.key ? col.accent : 'rgba(255,255,255,0.06)'}`,
              minHeight: '400px',
              padding: '16px',
              transition: 'all 0.2s ease',
            }}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: col.accent, fontSize: '1rem' }}>{col.icon}</span>
                <span className="fw-semibold text-white" style={{ fontSize: '0.95rem' }}>{col.label}</span>
                <span className="badge rounded-pill"
                  style={{ background: `${col.accent}22`, color: col.accent, fontSize: '0.7rem', padding: '3px 8px' }}>
                  {tasksByStatus(col.key).length}
                </span>
              </div>
              <button
                className="btn btn-sm"
                style={{
                  background: `${col.accent}18`, color: col.accent,
                  border: `1px solid ${col.accent}33`, borderRadius: '8px',
                  padding: '2px 8px', fontSize: '0.8rem'
                }}
                onClick={() => onAddTask(col.key)}
              >
                <FaPlus size={11} />
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: '2px', background: `linear-gradient(90deg, ${col.accent}, transparent)`, marginBottom: '12px', borderRadius: '2px' }} />

            {/* Task Cards */}
            <div className="d-flex flex-column gap-2">
              {tasksByStatus(col.key).length === 0 ? (
                <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.3 }}>{col.icon}</div>
                  No tasks here
                </div>
              ) : (
                tasksByStatus(col.key).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    accentColor={col.accent}
                    onClick={() => onTaskClick(task)}
                    onDragStart={() => handleDragStart(task)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
