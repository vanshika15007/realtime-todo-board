const Task = require('../models/Task');

let io; // Socket.IO instance holder

// ✅ Set socket instance from server.js
exports.setSocketInstance = (ioInstance) => {
  io = ioInstance;
};

// ✅ Get tasks assigned to current user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, tags, priority } = req.body;

    const task = new Task({
      title,
      description,
      status,
      dueDate,
      tags,
      priority,
      assignedTo: req.user.id, // set from auth middleware
    });

    await task.save();

    io.emit('taskCreated', task); // broadcast
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (io) {
      io.emit('taskUpdated', task);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (io) {
      io.emit('taskDeleted', task._id);
    }

    res.json({ message: 'Task deleted', taskId: task._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
