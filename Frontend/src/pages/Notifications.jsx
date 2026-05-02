import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaTimes, FaInbox, FaArrowLeft, FaClock, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: () => {} });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await API.put(`/notifications/${id}/action`, { action });
      toast.success(`Task ${action}!`);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const confirmDelete = (id) => {
    setModalConfig({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification? This action cannot be undone.',
      onConfirm: () => deleteNotification(id)
    });
    setShowModal(true);
  };

  const confirmClearAll = () => {
    setModalConfig({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all your notifications? This action cannot be undone.',
      onConfirm: clearAllNotifications
    });
    setShowModal(true);
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      toast.success('Notification deleted');
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete notification');
    } finally {
      setShowModal(false);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await API.delete('/notifications');
      toast.success('All notifications cleared');
      setNotifications([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear notifications');
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '40px 20px'
    }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="btn text-white-50 p-0 d-flex align-items-center gap-2 hover-white mb-4" style={{ background: 'none', border: 'none' }}>
            <FaArrowLeft /> Back
          </button>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="text-white fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Notifications</h2>
              <p className="text-muted small mb-0">Stay updated with your team's activities</p>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={confirmClearAll}
                className="btn d-flex align-items-center gap-2 px-3 py-2"
                style={{ background: 'rgba(239,83,80,0.1)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.2)', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem' }}
              >
                <FaTrash size={12} /> Clear All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <FaInbox size={48} className="text-muted mb-3 opacity-25" />
            <h5 className="text-white-50">All caught up!</h5>
            <p className="text-muted small">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifications.map((n) => (
              <div key={n._id} style={{
                background: n.status === 'pending' ? 'rgba(79,195,247,0.08)' : 'rgba(255,255,255,0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '24px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {n.status === 'pending' && (
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#4fc3f7' }} />
                )}

                <div className="d-flex gap-4">
                  {/* User Avatar */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 'bold', color: 'white', flexShrink: 0,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }}>
                    {n.sender?.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="text-white mb-1 fw-bold d-flex align-items-center gap-2">
                          {n.sender?.name}
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                            {n.sender?.role}
                          </span>
                        </h6>
                        <p className="text-white-50 mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                          {n.message}
                        </p>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                          <FaClock size={11} /> {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                        <button 
                          onClick={() => confirmDelete(n._id)}
                          className="btn btn-link text-white-50 p-0 hover-danger" 
                          style={{ transition: 'color 0.2s' }}
                          title="Delete notification"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons for Task Assignment/Completion */}
                    {n.status === 'pending' && (n.type === 'task_assignment' || n.type === 'task_completion') && (
                      <div className="d-flex gap-2 mt-4">
                        <button
                          className="btn d-flex align-items-center gap-2 px-4 py-2"
                          style={{ background: '#34d399', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}
                          onClick={() => handleAction(n._id, 'accepted')}
                        >
                          <FaCheck size={12} /> Accept
                        </button>
                        <button
                          className="btn d-flex align-items-center gap-2 px-4 py-2"
                          style={{ background: 'rgba(239,83,80,0.1)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.2)', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem' }}
                          onClick={() => handleAction(n._id, 'rejected')}
                        >
                          <FaTimes size={12} /> Reject
                        </button>
                      </div>
                    )}

                    {n.status !== 'pending' && (
                      <div className="mt-3">
                        <span className={`badge px-3 py-2 rounded-pill`} style={{
                          background: n.status === 'accepted' ? 'rgba(52,211,153,0.1)' : 'rgba(239,83,80,0.1)',
                          color: n.status === 'accepted' ? '#34d399' : '#ef5350',
                          fontSize: '0.75rem',
                          border: `1px solid ${n.status === 'accepted' ? 'rgba(52,211,153,0.2)' : 'rgba(239,83,80,0.2)'}`
                        }}>
                          {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal 
        show={showModal}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setShowModal(false)}
        type="warning"
      />
    </div>
  );
};

export default Notifications;

