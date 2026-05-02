import { FaUser, FaCalendar, FaComment, FaPaperclip, FaArrowRight } from 'react-icons/fa';

const priorityConfig = {
  low: { color: '#66bb6a', label: 'Low' },
  medium: { color: '#ffa726', label: 'Medium' },
  high: { color: '#ef5350', label: 'High' },
};

const TaskCard = ({ task, accentColor, onClick, onDragStart }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      className="position-relative"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        background: 'linear-gradient(145deg, #1e2a3a, #243447)',
        borderRadius: '12px',
        padding: '14px',
        cursor: 'grab',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${accentColor}44`;
        e.currentTarget.style.transform = 'scale(1.01)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Priority indicator */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
        background: priority.color, borderRadius: '12px 0 0 12px'
      }} />

      <div className="ps-1">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="badge" style={{
            background: `${priority.color}22`, color: priority.color,
            border: `1px solid ${priority.color}44`, fontSize: '0.65rem', borderRadius: '6px'
          }}>
            {priority.label}
          </span>
          <FaArrowRight size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>

        <p className="text-white mb-2 fw-semibold" style={{ fontSize: '0.88rem', lineHeight: 1.4, marginBottom: '8px' }}>
          {task.title}
        </p>

        {task.description && (
          <p className="text-muted mb-2" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            {task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}
          </p>
        )}

        <div className="d-flex align-items-center justify-content-between mt-2">
          <div className="d-flex align-items-center gap-2">
            {task.assignedTo ? (
              <div title={task.assignedTo.name} style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 'bold', color: 'white'
              }}>
                {task.assignedTo.name?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <FaUser size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
            )}

            {task.dueDate && (
              <span style={{
                fontSize: '0.68rem',
                color: isOverdue ? '#ef5350' : 'rgba(255,255,255,0.45)',
                display: 'flex', alignItems: 'center', gap: '3px'
              }}>
                <FaCalendar size={9} />
                {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {task.comments?.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FaComment size={9} /> {task.comments.length}
              </span>
            )}
            {task.attachments?.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FaPaperclip size={9} /> {task.attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
