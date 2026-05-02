import { useState } from 'react';
import { FaComment, FaTrash, FaPaperPlane } from 'react-icons/fa';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CommentThread = ({ task, projectId, onUpdate }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await API.post(`/projects/${projectId}/tasks/${task._id}/comments`, { text });
      setText('');
      onUpdate();
    } catch (err) {
      toast.error('Could not post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await API.delete(`/projects/${projectId}/tasks/${task._id}/comments/${commentId}`);
      onUpdate();
    } catch {
      toast.error('Could not delete comment');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h6 className="text-white d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.9rem' }}>
        <FaComment style={{ color: '#4fc3f7' }} />
        Comments ({task.comments?.length || 0})
      </h6>

      {/* Comment list */}
      <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: '240px', overflowY: 'auto' }}>
        {task.comments?.length === 0 && (
          <p className="text-muted text-center py-3" style={{ fontSize: '0.82rem' }}>No comments yet. Start the discussion!</p>
        )}
        {task.comments?.map((c) => (
          <div key={c._id} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
            padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div className="d-flex align-items-center gap-2">
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 'bold', color: 'white',
                  flexShrink: 0
                }}>
                  {c.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white fw-semibold" style={{ fontSize: '0.78rem' }}>{c.user?.name}</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{formatTime(c.createdAt)}</span>
              </div>
              {c.user?._id === user?._id && (
                <button className="btn btn-sm p-0" onClick={() => handleDelete(c._id)}
                  style={{ color: 'rgba(239,83,80,0.6)', background: 'none', border: 'none' }}>
                  <FaTrash size={10} />
                </button>
              )}
            </div>
            <p className="mb-0 text-white" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{c.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', borderRadius: '10px', fontSize: '0.85rem',
          }}
        />
        <button type="submit" disabled={loading || !text.trim()}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
            color: 'white', border: 'none', borderRadius: '10px', padding: '6px 14px',
            flexShrink: 0
          }}>
          {loading ? <span className="spinner-border spinner-border-sm" /> : <FaPaperPlane size={13} />}
        </button>
      </form>
    </div>
  );
};

export default CommentThread;
