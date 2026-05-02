import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaProjectDiagram, FaTasks, FaCheckCircle } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ projects: 0, tasks: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: projects } = await API.get('/projects');
        let tasks = 0, completed = 0;
        for (const p of projects) {
          const { data: t } = await API.get(`/projects/${p._id}/tasks`);
          tasks += t.length;
          completed += t.filter((x) => x.status === 'completed').length;
        }
        setStats({ projects: projects.length, tasks, completed });
      } catch {}
    };
    fetchStats();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      const payload = { name: form.name, bio: form.bio };
      if (form.password) payload.password = form.password;
      const { data } = await API.put('/auth/me', payload);
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: '10px'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: '700px' }}>
        {/* Avatar + Name Card */}
        <div className="text-center mb-4" style={{
          background: 'linear-gradient(145deg, #1e2a3a, #243447)',
          borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)',
          padding: '40px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold', color: 'white',
            boxShadow: '0 8px 24px rgba(79,195,247,0.3)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-white fw-bold mb-1">{user?.name}</h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>{user?.email}</p>
          {user?.bio && <p className="text-muted mt-2" style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '8px auto 0' }}>{user.bio}</p>}
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Projects', value: stats.projects, icon: <FaProjectDiagram />, color: '#4fc3f7' },
            { label: 'Total Tasks', value: stats.tasks, icon: <FaTasks />, color: '#ffa726' },
            { label: 'Completed', value: stats.completed, icon: <FaCheckCircle />, color: '#66bb6a' },
          ].map((s, i) => (
            <div className="col-4" key={i}>
              <div style={{ background: 'linear-gradient(145deg, #1e2a3a, #243447)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', textAlign: 'center' }}>
                <span style={{ color: s.color, fontSize: '1.3rem' }}>{s.icon}</span>
                <h4 className="text-white fw-bold mb-0 mt-1">{s.value}</h4>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        <div style={{ background: 'linear-gradient(145deg, #1e2a3a, #243447)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
              <FaUser style={{ color: '#4fc3f7' }} /> Profile Settings
            </h6>
            {!editing && (
              <button className="btn btn-sm d-flex align-items-center gap-1"
                onClick={() => setEditing(true)}
                style={{ background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.3)', borderRadius: '10px', fontSize: '0.8rem' }}>
                <FaEdit size={11} /> Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <FaUser style={{ color: '#4fc3f7', flexShrink: 0 }} />
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Full Name</small>
                  <span className="text-white" style={{ fontSize: '0.9rem' }}>{user?.name}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <FaEnvelope style={{ color: '#a78bfa', flexShrink: 0 }} />
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Email</small>
                  <span className="text-white" style={{ fontSize: '0.9rem' }}>{user?.email}</span>
                </div>
              </div>
              <div className="d-flex align-items-start gap-3 p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <FaEdit style={{ color: '#ffa726', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Bio</small>
                  <span className="text-white" style={{ fontSize: '0.9rem' }}>{user?.bio || 'No bio yet.'}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Full Name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Bio</label>
                <textarea className="form-control" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell your team about yourself..." style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>New Password</label>
                  <input type="password" className="form-control" placeholder="Leave blank to keep" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Confirm Password</label>
                  <input type="password" className="form-control" value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn flex-grow-1" onClick={() => setEditing(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                  <FaTimes size={12} className="me-2" />Cancel
                </button>
                <button type="submit" className="btn flex-grow-1 fw-semibold" disabled={saving}
                  style={{ background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px' }}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <FaSave size={12} className="me-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
