import { Link, useNavigate } from 'react-router-dom';
import { FaFolder, FaUsers, FaCalendar, FaTrash, FaCrown, FaTasks } from 'react-icons/fa';

const statusColors = {
  active: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
  completed: 'linear-gradient(135deg, #81c784, #388e3c)',
  archived: 'linear-gradient(135deg, #b0bec5, #607d8b)',
};

const priorityBadge = {
  active: 'info',
  completed: 'success',
  archived: 'secondary',
};

const ProjectCard = ({ project, onDelete, currentUserId, userRole }) => {
  const navigate = useNavigate();
  const isLead = userRole === 'lead';
  const progress = project.progress || 0;

  const progressColor =
    progress < 30 ? '#ef5350' : progress < 70 ? '#ffa726' : '#66bb6a';

  return (
    <div
      className="card h-100 border-0 position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1e2a3a, #243447)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: '4px', background: statusColors[project.status] || statusColors.active }} />

      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: statusColors[project.status] || statusColors.active,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaFolder color="white" size={18} />
            </div>
            {isLead && (
              <span className="badge d-flex align-items-center gap-1"
                style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '8px', fontSize: '0.7rem' }}>
                <FaCrown size={10} /> Team Lead
              </span>
            )}
          </div>
          <span className={`badge bg-${priorityBadge[project.status] || 'info'} rounded-pill`} style={{ fontSize: '0.7rem' }}>
            {project.status}
          </span>
        </div>

        <h5 className="card-title text-white fw-bold mb-1" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
          {project.title}
        </h5>
        <p className="mb-3" style={{ fontSize: '0.88rem', lineHeight: 1.5, minHeight: '2.5rem', color: 'rgba(255,255,255,0.85)' }}>
          {project.description?.slice(0, 90) || 'No description provided.'}{project.description?.length > 90 ? '…' : ''}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Progress</small>
            <small style={{ color: progressColor, fontWeight: 600, fontSize: '0.75rem' }}>{progress}%</small>
          </div>
          <div className="progress" style={{ height: '6px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)`,
                borderRadius: '10px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.78rem' }}>
            <FaTasks size={12} /> {project.taskCount || 0} tasks
          </span>
          <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.78rem' }}>
            <FaUsers size={12} /> {project.members?.length || 1} members
          </span>
          {project.deadline && (
            <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.78rem' }}>
              <FaCalendar size={11} /> {new Date(project.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Member Avatars */}
        <div className="d-flex align-items-center">
          {project.members?.slice(0, 4).map((m, i) => (
            <div key={m._id || i} title={m.name}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: `hsl(${(i * 60) + 200}, 70%, 55%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 'bold', color: 'white',
                marginLeft: i > 0 ? '-8px' : '0',
                border: '2px solid #1e2a3a', zIndex: 4 - i,
              }}>
              {m.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', color: '#aaa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', marginLeft: '-8px', border: '2px solid #1e2a3a'
            }}>
              +{project.members.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="card-footer border-0 d-flex gap-2 px-4 pb-4 pt-0">
        <button
          className="btn btn-sm flex-grow-1 fw-semibold"
          onClick={() => navigate(`/project/${project._id}`)}
          style={{
            background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
            color: 'white', border: 'none', borderRadius: '10px',
          }}>
          Open Project
        </button>
        {isLead && (
          <button
            className="btn btn-sm"
            onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
            style={{ background: 'rgba(239,83,80,0.15)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: '10px' }}>
            <FaTrash size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
