import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFolder, FaTimes, FaProjectDiagram } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

const STATS_STYLE = (color) => ({
  background: `linear-gradient(145deg, rgba(30,42,58,0.9), rgba(36,52,71,0.9))`,
  borderRadius: '16px',
  border: `1px solid ${color}22`,
  padding: '20px 24px',
  boxShadow: `0 4px 20px ${color}11`,
});

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', tags: '' });
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Project title is required');
    setCreating(true);
    try {
      await API.post('/projects', form);
      toast.success('Project created! 🎉');
      setShowModal(false);
      setForm({ title: '', description: '', deadline: '', tags: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const executeDelete = async () => {
    const id = confirmDelete.id;
    try {
      await API.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Could not delete project');
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    avgProgress: projects.length
      ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
      : 0,
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', borderRadius: '10px'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <Navbar />

      <div className="container-fluid px-4 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="text-white fw-bold mb-1" style={{ fontSize: '1.8rem' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <span style={{ background: 'linear-gradient(90deg, #4fc3f7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.name?.split(' ')[0]}
              </span> 👋
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Manage your academic projects and collaborate with your team.
            </p>
          </div>
          {user?.role === 'lead' && (
            <button
              id="create-project-btn"
              className="btn d-flex align-items-center gap-2 fw-semibold"
              onClick={() => setShowModal(true)}
              style={{
                background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
                color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px',
                boxShadow: '0 4px 16px rgba(79,195,247,0.25)'
              }}>
              <FaPlus /> New Project
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Projects', value: stats.total, color: '#4fc3f7', icon: <FaProjectDiagram /> },
            { label: 'Active', value: stats.active, color: '#ffa726', icon: '🔥' },
            { label: 'Completed', value: stats.completed, color: '#66bb6a', icon: '✅' },
            { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: '#a78bfa', icon: '📊' },
          ].map((s, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div style={STATS_STYLE(s.color)}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.78rem', fontWeight: 500 }}>{s.label}</p>
                    <h3 className="text-white fw-bold mb-0" style={{ fontSize: '1.8rem', color: s.color }}>{s.value}</h3>
                  </div>
                  <span style={{ fontSize: '1.6rem', opacity: 0.8 }}>{s.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
          <div className="input-group flex-grow-1" style={{ maxWidth: '340px' }}>
            <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#4fc3f7', borderRight: 'none' }}>
              <FaSearch size={13} />
            </span>
            <input
              type="text" className="form-control" placeholder="Search projects..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, borderLeft: 'none' }}
            />
          </div>
          {['all', 'active', 'completed', 'archived'].map((s) => (
            <button key={s}
              className="btn btn-sm"
              onClick={() => setFilterStatus(s)}
              style={{
                borderRadius: '10px', fontSize: '0.82rem', padding: '6px 14px',
                background: filterStatus === s ? 'linear-gradient(135deg, #4fc3f7, #a78bfa)' : 'rgba(255,255,255,0.06)',
                color: filterStatus === s ? 'white' : '#aaa',
                border: filterStatus === s ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem' }} />
            <p className="text-muted mt-3">Loading your projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <FaFolder size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <h5 className="text-muted">No projects found</h5>
          </div>
        ) : (
          <>
            {/* Active Projects */}
            {filtered.filter(p => p.status !== 'completed').length > 0 && (
              <div className="mb-5">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffa726' }}></span>
                  Active Projects
                </h5>
                <div className="row g-3">
                  {filtered.filter(p => p.status !== 'completed').map((project) => (
                    <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={project._id}>
                      <ProjectCard
                        project={project}
                        onDelete={handleDelete}
                        currentUserId={user?._id}
                        userRole={user?.role}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Projects Section */}
            {filtered.filter(p => p.status === 'completed').length > 0 && (
              <div className="mb-5">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#66bb6a' }}></span>
                  Completed Projects 🏆
                </h5>
                <div className="row g-3">
                  {filtered.filter(p => p.status === 'completed').map((project) => (
                    <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={project._id}>
                      <ProjectCard
                        project={project}
                        onDelete={handleDelete}
                        currentUserId={user?._id}
                        userRole={user?.role}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1050,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '480px',
            background: 'linear-gradient(145deg, #1a2332, #1e2d40)',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)', padding: '32px'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="text-white fw-bold mb-0">Create New Project</h5>
                <small className="text-muted">Set up your academic project</small>
              </div>
              <button className="btn" onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '10px', border: 'none' }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Project Title *</label>
                <input className="form-control" placeholder="e.g. Machine Learning Research"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                  style={inputStyle} />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Description</label>
                <textarea className="form-control" rows={3} placeholder="What is this project about?"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Deadline</label>
                  <input type="date" className="form-control" value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Tags</label>
                  <input className="form-control" placeholder="ML, Research, NLP"
                    value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    style={inputStyle} />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn flex-grow-1"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn flex-grow-1 fw-semibold" disabled={creating}
                  style={{ background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px' }}>
                  {creating ? <span className="spinner-border spinner-border-sm me-2" /> : <FaPlus className="me-2" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Project?"
        message="This will permanently delete the project and all associated tasks. This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
        type="danger"
      />
    </div>
  );
};

export default Dashboard;
