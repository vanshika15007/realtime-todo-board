import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import socket from '../socket';
import axios from '../axios';
import AddTaskModal from '../components/AddTaskModal';
import TaskCard from '../components/TaskCard';
import ActivityLog from '../components/ActivityLog';
import { useNavigate } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import './Dashboard.css';

const columns = ['Todo', 'In Progress', 'Done'];
const cardColors = {
  'Low': 'bg-green-100 border-l-4 border-green-500',
  'Medium': 'bg-yellow-100 border-l-4 border-yellow-500',
  'High': 'bg-red-100 border-l-4 border-red-500'
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark') === 'true');
  const navigate = useNavigate();

  useDarkMode(darkMode);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const onDragEnd = async ({ destination, source, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const updated = { ...task, status: destination.droppableId };
    try {
      await axios.put(`/api/tasks/${draggableId}`, updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setShowThankYou(true);
    setTimeout(() => navigate('/'), 2000);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setOpenModal(true);
  };

  useEffect(() => {
    fetchTasks();

    socket.on('task:added', task => setTasks(prev => [...prev, task]));
    socket.on('task:updated', updated =>
      setTasks(prev => prev.map(t => (t._id === updated._id ? updated : t)))
    );
    socket.on('task:deleted', id =>
      setTasks(prev => prev.filter(t => t._id !== id))
    );

    return () => socket.off();
  }, []);

  return (
    <div className="dash p-6 max-w-screen-xl mx-auto min-h-screen transition-all">
      <div className="board-header">
        <h2 className="board-title">
          <span role="img" aria-label="logo">🗂️</span> Your Todo Board
        </h2>
        <div className="board-actions">
          <button
            onClick={() => setOpenModal(true)}
            className="add-task-btn"
          >
            + Add Task
          </button>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>

      {showThankYou && (
        <div className="mb-4 text-green-600 font-semibold">Thank you! Logging out...</div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board grid md:grid-cols-3 gap-8">
          {columns.map(col => (
            <Droppable key={col} droppableId={col}>
              {(provided) => {
                const columnTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === col) : [];
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="kanban-column bg-white rounded-xl shadow-md p-4 min-h-[200px] flex flex-col"
                  >
                    <h3 className="column-title font-bold text-lg text-gray-700 mb-4 border-b pb-2 text-center uppercase tracking-wide">{col}</h3>
                    {columnTasks.length === 0 && (
                      <div className="text-gray-400 text-center italic py-8">No tasks</div>
                    )}
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="kanban-card mb-4 last:mb-0"
                          >
                            <TaskCard task={task} onEdit={() => handleEdit(task)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <div className="activity-log-panel mt-8">
        <ActivityLog />
      </div>

      {openModal && (
        <AddTaskModal
          onClose={() => {
            setOpenModal(false);
            setEditTask(null);
          }}
          editTask={editTask}
          tasks={tasks}
        />
      )}
    </div>
  );
};

export default Dashboard;