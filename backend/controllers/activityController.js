const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// Create activity log entry
const createActivityLog = async (userId, action, entityType, entityId, description, details = {}) => {
  try {
    const activityLog = new ActivityLog({
      user: userId,
      action,
      entityType,
      entityId,
      description,
      details
    });
    await activityLog.save();
    return activityLog;
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

// Get last 20 activities
const getRecentActivities = async (req, res) => {
  try {
    // Only fetch activities for the logged-in user
    const activities = await ActivityLog.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Smart assign logic
const smartAssign = async (req, res) => {
  try {
    const taskId = req.params.id; // Use 'id' to match the route
    
    // Get all users and their active task counts
    const users = await User.find();
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await require('../models/Task').countDocuments({
          assignedTo: user._id,
          status: { $in: ['Todo', 'In Progress'] }
        });
        return { user, taskCount };
      })
    );
    
    // Find user with least tasks
    const userWithLeastTasks = userTaskCounts.reduce((min, current) => 
      current.taskCount < min.taskCount ? current : min
    );
    
    // Update task assignment
    const task = await require('../models/Task').findByIdAndUpdate(
      taskId,
      { assignedTo: userWithLeastTasks.user._id },
      { new: true }
    );
    
    // Log the smart assign action
    await createActivityLog(
      req.user.id,
      'SMART_ASSIGN',
      'TASK',
      taskId,
      `Task "${task.title}" smart assigned to ${userWithLeastTasks.user.name}`,
      { 
        previousAssignee: task.assignedTo,
        newAssignee: userWithLeastTasks.user._id,
        assigneeTaskCount: userWithLeastTasks.taskCount
      }
    );
    
    // Emit socket event
    if (req.io) {
      req.io.emit('task:updated', task);
    }
    
    res.json({
      task,
      assignedTo: userWithLeastTasks.user.name,
      taskCount: userWithLeastTasks.taskCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createActivityLog,
  getRecentActivities,
  smartAssign
}; 