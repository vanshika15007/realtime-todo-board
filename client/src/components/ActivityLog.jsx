import React, { useEffect, useState } from 'react';
import axios from '../axios';
import socket from '../socket';
import './ActivityLog.css';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activities', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Listen for real-time updates
    socket.on('task:added', () => fetchActivities());
    socket.on('task:updated', () => fetchActivities());
    socket.on('task:deleted', () => fetchActivities());

    return () => {
      socket.off('task:added');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      case 'ASSIGN': return '👤';
      case 'STATUS_CHANGE': return '🔄';
      case 'SMART_ASSIGN': return '🧠';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="activity-log">
        <h3>📋 Activity Log</h3>
        <div className="loading">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <h3>📋 Activity Log</h3>
      <div className="activities-list">
        {activities.length === 0 ? (
          <div className="no-activities">No activities yet</div>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-icon">
                {getActionIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-description">
                  {activity.description}
                </div>
                <div className="activity-meta">
                  <span className="activity-user">
                    {activity.user?.name || 'Unknown User'}
                  </span>
                  <span className="activity-time">
                    {formatTime(activity.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
