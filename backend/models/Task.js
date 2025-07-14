const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        const columnNames = ['Todo', 'In Progress', 'Done'];
        return !columnNames.includes(v);
      },
      message: 'Task title cannot match column names (Todo, In Progress, Done)'
    }
  },
  description: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo',
  },
  dueDate: Date,
  tags: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  version: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Compound index for unique title per assigned user
taskSchema.index({ title: 1, assignedTo: 1 }, { unique: true });

// Increment version on save
taskSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
