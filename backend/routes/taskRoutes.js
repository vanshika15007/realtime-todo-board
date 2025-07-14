const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middlewares/auth');
const { createActivityLog } = require('../controllers/activityController');

// 📥 Create Task
router.post('/', auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedTo: req.user.id });
    
    // Log the activity
    await createActivityLog(
      req.user.id,
      'CREATE',
      'TASK',
      task._id,
      `Created task "${task.title}"`,
      { status: task.status, priority: task.priority }
    );
    
    req.io.emit('task:added', task); // 🔄 Notify all clients
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Task title must be unique for this user' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// 📤 Get All Tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✏️ Update Task with conflict detection
router.put('/:id', auth, async (req, res) => {
  try {
    const { version } = req.body;
    const taskId = req.params.id;
    
    // Check for conflicts
    const currentTask = await Task.findById(taskId);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (version && currentTask.version > version) {
      return res.status(409).json({ 
        message: 'Conflict detected - task has been modified by another user',
        currentVersion: currentTask.version,
        currentTask: currentTask
      });
    }
    
    const oldTask = { ...currentTask.toObject() };
    const task = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
    
    // Log the activity
    await createActivityLog(
      req.user.id,
      'UPDATE',
      'TASK',
      task._id,
      `Updated task "${task.title}"`,
      { 
        previousStatus: oldTask.status,
        newStatus: task.status,
        changes: req.body
      }
    );
    
    req.io.emit('task:updated', task);
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Task title must be unique for this user' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// 🗑️ Delete Task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    // Log the activity
    await createActivityLog(
      req.user.id,
      'DELETE',
      'TASK',
      req.params.id,
      `Deleted task "${task.title}"`,
      { status: task.status, priority: task.priority }
    );
    
    req.io.emit('task:deleted', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🧠 Smart Assign Task
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    const { smartAssign } = require('../controllers/activityController');
    await smartAssign(req, res);
  } catch (err) {
    console.error('Error smart assigning task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
