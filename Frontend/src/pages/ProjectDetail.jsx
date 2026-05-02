import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import FileUpload from '../components/FileUpload';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowLeft, FaUsers, FaPlus, FaUserPlus, FaFolder,
  FaCrown, FaCalendar, FaTag, FaTimes, FaCog
} from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeTaskStates, setFinalizeTaskStates] = useState({}); // {taskId: boolean}
  const [newTaskStatus, setNewTaskStatus] = useState('backlog');
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
  const [creating, setCreating] = useState(false);
  const [confirmMember, setConfirmMember] = useState({ show: false, userId: null });

  const isLead = user?.role === 'lead';

  const fetchProject = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error('Could not load project');
      navigate('/dashboard');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await API.get(`/projects/${id}/tasks`);
      setTasks(data);
    } catch {
      toast.error('Could not load tasks');
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchProject();
      await fetchTasks();
      setLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await API.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
      fetchProject(); // refresh progress
    } catch {
      toast.error('Could not update task status');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    console.log('Attempting to create task with form:', taskForm, 'Status:', newTaskStatus);
    if (!taskForm.title.trim()) return toast.error('Task title required');
    setCreating(true);
    try {
      const { data } = await API.post(`/projects/${id}/tasks`, { ...taskForm, status: newTaskStatus });
      console.log('Task created successfully:', data);
      setTasks((prev) => [...prev, data]);
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
      fetchProject();
      toast.success('Task created!');
    } catch (err) {
      console.error('Task creation failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Error creating task');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await API.post(`/projects/${id}/members`, { userId });
      fetchProject();
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = (userId) => {
    setConfirmMember({ show: true, userId });
  };

  const executeRemoveMember = async () => {
    const userId = confirmMember.userId;
    try {
      await API.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
      toast.success('Member removed');
    } catch {
      toast.error('Could not remove member');
    } finally {
      setConfirmMember({ show: false, userId: null });
    }
  };

  const progress = project?.progress || 0;
  const progressColor = progress < 30 ? '#ef5350' : progress < 70 ? '#ffa726' : '#66bb6a';

  const tabStyle = (active) => ({
    padding: '8px 18px', borderRadius: '10px', border: 'none', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
    background: active ? 'linear-gradient(135deg, #4fc3f7, #a78bfa)' : 'rgba(255,255,255,0.06)',
    color: active ? 'white' : '#aaa',
    transition: 'all 0.2s ease'
  });

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: '10px'
  };

  const handleCompleteProject = async () => {
    console.log('Finalizing project:', id);
    try {
      await API.put(`/projects/${id}`, { status: 'completed' });
      toast.success('Project marked as completed! 🏆');
      setShowFinalizeModal(false);
      fetchProject();
      fetchTasks(); // Refresh tasks to see them all as completed
    } catch (err) {
      console.error('Finalize project failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to complete project');
    }
  };

  const openFinalizeModal = () => {
    // Initialize task states to false (pending)
    const initial = {};
    tasks.forEach(t => initial[t._id] = t.status === 'completed');
    setFinalizeTaskStates(initial);
    setShowFinalizeModal(true);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <Navbar />

      <div className="container-fluid px-4 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back */}
        <button className="btn btn-sm mb-3 d-flex align-items-center gap-2"
          onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa', border: 'none', borderRadius: '10px' }}>
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>

        {/* Project Header Card */}
        <div className="mb-4 p-4" style={{
          background: 'linear-gradient(145deg, #1e2a3a, #243447)',
          borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-2">
                {isLead && (
                  <span className="badge d-flex align-items-center gap-1"
                    style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '8px', fontSize: '0.72rem' }}>
                    <FaCrown size={10} /> Team Lead
                  </span>
                )}
                <span className="badge"
                  style={{ background: project?.status === 'active' ? 'rgba(79,195,247,0.15)' : 'rgba(102,187,106,0.15)', color: project?.status === 'active' ? '#4fc3f7' : '#66bb6a', border: 'none', borderRadius: '8px', fontSize: '0.72rem' }}>
                  {project?.status}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-1">
                <h2 className="text-white fw-bold mb-0">{project?.title}</h2>
                {project?.admin?._id === user?._id && project?.status !== 'completed' && (
                  <button className="btn btn-sm fw-bold px-4 py-2" onClick={openFinalizeModal}
                    style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52,211,153,0.3)' }}>
                    Finalize Project
                  </button>
                )}
              </div>
              <p className="mb-3" style={{ fontSize: '0.92rem', maxWidth: '600px', color: 'rgba(255,255,255,0.85)' }}>{project?.description}</p>

              {/* Tags */}
              {project?.tags?.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="badge d-flex align-items-center gap-1"
                      style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '6px', fontSize: '0.7rem' }}>
                      <FaTag size={8} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress */}
              <div style={{ maxWidth: '400px' }}>
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Overall Progress</small>
                  <small style={{ color: progressColor, fontWeight: 600 }}>{progress}%</small>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)' }}>
                  <div className="progress-bar" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}aa)`, borderRadius: '10px', transition: 'width 0.8s ease' }} />
                </div>
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>{project?.taskCount || 0} total tasks</small>
              </div>
            </div>

            {/* Meta */}
            <div className="d-flex flex-row flex-md-column gap-2 flex-wrap">
              {project?.deadline && (
                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.82rem' }}>
                  <FaCalendar size={13} style={{ color: '#ffa726' }} />
                  <span>{new Date(project.deadline).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.82rem' }}>
                <FaUsers size={13} style={{ color: '#4fc3f7' }} />
                <span>{project?.members?.length || 1} member{project?.members?.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'board', label: '📋 Kanban Board' },
            { key: 'files', label: '📁 Files' },
            { key: 'members', label: '👥 Team' },
          ].map((tab) => (
            <button key={tab.key} style={tabStyle(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
          {isLead && (
            <button
              className="btn btn-sm ms-auto d-flex align-items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.82rem' }}
              onClick={() => { setNewTaskStatus('backlog'); setShowAddTask(true); }}>
              <FaPlus size={11} /> Add Task
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'board' && (
          <KanbanBoard
            tasks={tasks}
            onTaskClick={setSelectedTask}
            onAddTask={(status) => { setNewTaskStatus(status); setShowAddTask(true); }}
            onStatusChange={handleStatusChange}
            isAdmin={isLead}
          />
        )}

        {activeTab === 'files' && (
          <div style={{ maxWidth: '600px' }}>
            <h6 className="text-white mb-3 d-flex align-items-center gap-2">
              <FaFolder style={{ color: '#4fc3f7' }} /> Project Files
            </h6>
            <FileUpload
              projectId={id}
              files={project?.files || []}
              onFilesUpdate={fetchProject}
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-white mb-0 d-flex align-items-center gap-2">
                <FaUsers style={{ color: '#4fc3f7' }} /> Team Members
              </h6>
              {isLead && (
                <button className="btn btn-sm d-flex align-items-center gap-1"
                  style={{ background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.3)', borderRadius: '10px', fontSize: '0.8rem' }}
                  onClick={() => { setShowAddMember(true); API.get('/auth/users').then(({ data }) => setAllUsers(data)); }}>
                  <FaUserPlus size={11} /> Invite Member
                </button>
              )}
            </div>
            <div className="d-flex flex-column gap-2">
              {project?.members?.map((m) => (
                <div key={m._id} className="d-flex align-items-center justify-content-between p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold', color: 'white', flexShrink: 0
                    }}>
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white mb-0 fw-semibold" style={{ fontSize: '0.88rem' }}>
                        {m.name}
                        {(project?.admin?._id === m._id || project?.admin === m._id) && (
                          <span className="ms-2 badge" style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107', fontSize: '0.65rem', borderRadius: '6px' }}>
                            <FaCrown size={8} className="me-1" />Admin
                          </span>
                        )}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{m.email}</p>
                    </div>
                  </div>
                  {isLead && m._id !== user?._id && (
                    <button className="btn btn-sm"
                      onClick={() => handleRemoveMember(m._id)}
                      style={{ background: 'rgba(239,83,80,0.1)', color: '#ef5350', border: 'none', borderRadius: '8px', padding: '4px 10px' }}>
                      <FaTimes size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: 'linear-gradient(145deg, #1a2332, #1e2d40)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', padding: '32px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">New Task</h5>
              <button className="btn" onClick={() => setShowAddTask(false)} style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '10px', border: 'none' }}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Task Title *</label>
                <input className="form-control" placeholder="What needs to be done?"
                  value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required style={inputStyle} />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Description</label>
                <textarea className="form-control" rows={2} placeholder="Add details..."
                  value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Status</label>
                  <select className="form-select" value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value)} style={inputStyle}>
                    <option value="backlog">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Priority</label>
                  <select className="form-select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Due Date</label>
                  <input type="date" className="form-control" value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Assign To</label>
                <select className="form-select" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} style={inputStyle}>
                  <option value="">Unassigned</option>
                  {project?.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn flex-grow-1" onClick={() => setShowAddTask(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn flex-grow-1 fw-semibold" disabled={creating}
                  style={{ background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px' }}>
                  {creating ? <span className="spinner-border spinner-border-sm me-2" /> : null} Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: 'linear-gradient(145deg, #1a2332, #1e2d40)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', padding: '28px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-white fw-bold mb-0">Invite Member</h6>
              <button className="btn" onClick={() => setShowAddMember(false)} style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '10px', border: 'none' }}>
                <FaTimes />
              </button>
            </div>
            <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allUsers.filter((u) => u._id !== user?._id && !project?.members?.some((m) => m._id === u._id)).map((u) => (
                <div key={u._id} className="d-flex align-items-center justify-content-between p-2 px-3"
                  style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.82rem' }}>
                        {u.name}
                        {u.role === 'lead' && (
                          <span className="badge" style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107', fontSize: '0.6rem', borderRadius: '4px' }}>
                            Lead
                          </span>
                        )}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{u.email}</p>
                    </div>
                  </div>
                  <button className="btn btn-sm" onClick={() => handleAddMember(u._id)}
                    style={{ background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.3)', borderRadius: '8px', fontSize: '0.75rem', padding: '3px 10px' }}>
                    Add
                  </button>
                </div>
              ))}
              {allUsers.filter((u) => !project?.members?.some((m) => m._id === u._id)).length === 0 && (
                <p className="text-muted text-center py-3" style={{ fontSize: '0.85rem' }}>All registered users are already members.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={id}
          members={project?.members}
          isAdmin={isLead}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => { fetchTasks(); fetchProject(); }}
          onDelete={(taskId) => setTasks((prev) => prev.filter((t) => t._id !== taskId))}
        />
      )}

      {/* Confirm Remove Member Modal */}
      <ConfirmModal
        show={confirmMember.show}
        title="Remove Member?"
        message="Are you sure you want to remove this member from the project? They will lose access to all tasks and files."
        onConfirm={executeRemoveMember}
        onCancel={() => setConfirmMember({ show: false, userId: null })}
        type="warning"
      />

      {/* Finalize Project Modal */}
      {showFinalizeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '600px', maxHeight: '80vh',
            background: '#1a1a2e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div className="p-4 border-bottom border-white-5">
              <h5 className="text-white mb-0 fw-bold">Final Review: {project?.title}</h5>
              <p className="text-muted small mb-0">Review all tasks before completing the project.</p>
            </div>
            <div className="p-4 overflow-auto flex-grow-1">
              <div className="d-flex flex-column gap-3">
                {tasks.map(t => (
                  <div key={t._id} className="d-flex align-items-center justify-content-between p-3"
                    style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ 
                        width: '12px', height: '12px', borderRadius: '50%', 
                        background: finalizeTaskStates[t._id] ? '#34d399' : '#fbbf24' 
                      }} />
                      <div>
                        <p className="text-white mb-0 small fw-bold">{t.title}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Assigned to: {t.assignedTo?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className={`btn ${!finalizeTaskStates[t._id] ? 'btn-warning active' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => setFinalizeTaskStates({...finalizeTaskStates, [t._id]: false})}
                      >
                        Pending
                      </button>
                      <button 
                        className={`btn ${finalizeTaskStates[t._id] ? 'btn-success active' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => setFinalizeTaskStates({...finalizeTaskStates, [t._id]: true})}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-top border-white-5 d-flex gap-3">
              <button className="btn btn-secondary flex-grow-1" style={{ borderRadius: '12px' }} onClick={() => setShowFinalizeModal(false)}>Cancel</button>
              <button 
                className="btn flex-grow-1 fw-bold" 
                disabled={!Object.values(finalizeTaskStates).every(v => v === true)}
                style={{ 
                  background: Object.values(finalizeTaskStates).every(v => v === true) ? '#34d399' : 'rgba(255,255,255,0.1)', 
                  color: Object.values(finalizeTaskStates).every(v => v === true) ? 'white' : 'rgba(255,255,255,0.3)',
                  border: 'none', borderRadius: '12px' 
                }}
                onClick={handleCompleteProject}
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
