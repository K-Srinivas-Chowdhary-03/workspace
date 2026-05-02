import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import CommentThread from './CommentThread';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';

import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['backlog', 'in-progress', 'review', 'completed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const TaskModal = ({ task, projectId, members, onClose, onUpdate, onDelete, isAdmin }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo?._id || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.substring(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [localTask, setLocalTask] = useState(task);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { setLocalTask(task); }, [task]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put(`/projects/${projectId}/tasks/${task._id}`, form);
      toast.success('Task updated!');
      setLocalTask(data);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    setSaving(true);
    try {
      await API.put(`/projects/${projectId}/tasks/${task._id}`, { ...form, requestReview: true });
      toast.success('Work submitted for review!');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => setShowConfirm(true);

  const executeDelete = async () => {
    try {
      await API.delete(`/projects/${projectId}/tasks/${task._id}`);
      toast.success('Task deleted');
      onDelete(task._id);
      onClose();
    } catch (err) {
      toast.error('Could not delete task');
    } finally {
      setShowConfirm(false);
    }
  };

  const refreshTask = async () => {
    const { data } = await API.get(`/projects/${projectId}/tasks`);
    const updated = data.find((t) => t._id === task._id);
    if (updated) setLocalTask(updated);
  };

  const priorityAccent = { low: '#66bb6a', medium: '#ffa726', high: '#ef5350' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1050,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(145deg, #1a2332, #1e2d40)',
        borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-0">
          <div>
            <h5 className="text-white mb-0 fw-bold">Edit Task</h5>
            <small className="text-muted">Update task details or leave comments</small>
          </div>
          <button className="btn" onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '10px', border: 'none' }}>
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          {/* Title */}
          <div className="mb-3">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Task Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="form-control"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }}
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="form-control"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', borderRadius: '10px', resize: 'none' }}
            />
          </div>

          <div className="row g-3 mb-3">
            {/* Status */}
            <div className="col-6 col-md-3">
              <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="form-select"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="col-6 col-md-3">
              <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-select"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: priorityAccent[form.priority], borderRadius: '10px' }}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>

            {/* Assigned To */}
            <div className="col-12 col-md-3">
              <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Assign To</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="form-select"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px' }}>
                <option value="">Unassigned</option>
                {members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div className="col-12 col-md-3">
              <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="form-control"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px', colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-4">
            {task.assignedTo?._id === user?._id && task.status !== 'completed' && task.status !== 'review' && (
              <button className="btn flex-grow-1 fw-semibold" onClick={handleSubmitReview} disabled={saving}
                style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px' }}>
                Submit Work for Review
              </button>
            )}
            {isAdmin && (
              <button className="btn" onClick={handleDelete}
                style={{ background: 'rgba(239,83,80,0.15)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: '10px', padding: '0 15px' }}>
                <FaTrash size={13} />
              </button>
            )}
          </div>

          {/* Divider */}
          <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          {/* Comments */}
          <CommentThread
            task={localTask}
            projectId={projectId}
            onUpdate={() => { refreshTask(); onUpdate(); }}
          />
        </div>
      </div>

      <ConfirmModal
        show={showConfirm}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => setShowConfirm(false)}
        type="danger"
      />
    </div>
  );
};

export default TaskModal;
