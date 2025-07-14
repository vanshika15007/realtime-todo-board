import React from 'react';
import axios from '../axios';
import './TaskCard.css';

const priorityColors = {
  Low: 'card-low',
  Medium: 'card-medium',
  High: 'card-high'
};

const TaskCard = ({ task, onEdit }) => {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  const handleSmartAssign = async () => {
    try {
      const res = await axios.post(`/tasks/${task._id}/smart-assign`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(`Task assigned to ${res.data.assignedTo} (now has ${res.data.taskCount} active tasks)`);
    } catch (err) {
      alert(err.response?.data?.message || 'Smart assign failed');
    }
  };

  return (
    <div className={`task-card modern-card ${priorityColors[task.priority] || ''}`}>
      <div className="priority-badge-container">
        <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      <div className="task-card-content">
        <h4 className="task-title">{task.title}</h4>
        <p className="description">{task.description}</p>
        <div className="tags">
          {task.tags?.map((tag, idx) => (
            <span className="tag" key={idx}>#{tag}</span>
          ))}
        </div>
        {task.dueDate && (
          <p className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
        <div className="task-card-actions">
          <button className="edit-btn" aria-label="Edit Task" onClick={() => onEdit(task)} role="button">✏️ Edit</button>
          <button className="delete-btn" aria-label="Delete Task" onClick={handleDelete} role="button">🗑️ Delete</button>
          <button className="smart-assign-btn" aria-label="Smart Assign Task" onClick={handleSmartAssign} role="button">🤖 Smart Assign</button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
