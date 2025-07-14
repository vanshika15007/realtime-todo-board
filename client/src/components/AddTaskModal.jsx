import React, { useEffect, useState } from 'react';
import axios from '../axios';
import './AddTaskModal.css';

const AddTaskModal = ({ onClose, editTask, tasks = [] }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '',
    tags: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null); // { currentTask, yourTask }
  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        status: editTask.status,
        dueDate: editTask.dueDate?.substring(0, 10),
        tags: editTask.tags?.join(', ') || '',
      });
    }
  }, [editTask]);

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return false;
    }
    const columnNames = ['Todo', 'In Progress', 'Done'];
    if (columnNames.includes(form.title.trim())) {
      setError('Task title cannot match column names (Todo, In Progress, Done)');
      return false;
    }
    // Unique title validation (case-insensitive, ignore current task when editing)
    const titleLower = form.title.trim().toLowerCase();
    const duplicate = tasks.some(
      t => t.title.trim().toLowerCase() === titleLower && (!editTask || t._id !== editTask._id)
    );
    if (duplicate) {
      setError('Task title must be unique');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    try {
      if (editTask) {
        payload.version = editTask.version;
        await axios.put(`/tasks/${editTask._id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post('/tasks', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        // Conflict detected
        setConflict({
          currentTask: err.response.data.currentTask,
          yourTask: { ...payload },
        });
        setShowConflictModal(true);
      } else {
        setError(err.response?.data?.message || 'Failed to save task');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverwrite = async () => {
    if (!editTask) return;
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    // Remove version to force overwrite
    delete payload.version;
    try {
      await axios.put(`/tasks/${editTask._id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShowConflictModal(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to overwrite task');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!editTask || !conflict) return;
    setLoading(true);
    setError('');
    // Merge: prefer user's changes, but fill in any missing fields from currentTask
    const merged = { ...conflict.currentTask, ...form };
    merged.tags = form.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    // Remove version to force update
    delete merged.version;
    try {
      await axios.put(`/tasks/${editTask._id}`, merged, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShowConflictModal(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to merge task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h3 id="modal-title">{editTask ? 'Edit Task' : 'Add New Task'}</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} aria-label="Task Form">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <div className="btn-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editTask ? 'Update' : 'Add')}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
        {showConflictModal && conflict && (
          <div className="conflict-modal">
            <h4>Conflict Detected</h4>
            <p>This task was modified by another user. Please review both versions below:</p>
            <div className="conflict-versions">
              <div className="conflict-version-block">
                <strong>Current Version</strong>
                <div>Title: {conflict.currentTask.title}</div>
                <div>Description: {conflict.currentTask.description}</div>
                <div>Priority: {conflict.currentTask.priority}</div>
                <div>Status: {conflict.currentTask.status}</div>
                <div>Due Date: {conflict.currentTask.dueDate ? conflict.currentTask.dueDate.substring(0,10) : ''}</div>
                <div>Tags: {conflict.currentTask.tags?.join(', ')}</div>
              </div>
              <div className="conflict-version-block">
                <strong>Your Version</strong>
                <div>Title: {conflict.yourTask.title}</div>
                <div>Description: {conflict.yourTask.description}</div>
                <div>Priority: {conflict.yourTask.priority}</div>
                <div>Status: {conflict.yourTask.status}</div>
                <div>Due Date: {conflict.yourTask.dueDate}</div>
                <div>Tags: {conflict.yourTask.tags?.join(', ')}</div>
              </div>
            </div>
            <div className="btn-group">
              <button onClick={handleMerge} disabled={loading}>Merge</button>
              <button onClick={handleOverwrite} disabled={loading}>Overwrite</button>
              <button onClick={() => setShowConflictModal(false)} disabled={loading}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTaskModal;
