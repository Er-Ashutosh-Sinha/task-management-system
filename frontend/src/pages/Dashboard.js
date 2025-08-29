import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import statsService from '../services/statsService';
import TaskSummary from '../components/TaskSummary';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await statsService.getStatsOverview(token);
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-container">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="welcome-message">
        <h2>Welcome, {user?.name}!</h2>
        <p>{"Here's an overview of your tasks"}</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <TaskSummary
            title="To Do"
            count={stats.tasksByStatus.todo}
            color="todo"
          />
          <TaskSummary
            title="In Progress"
            count={stats.tasksByStatus['in-progress']}
            color="in-progress"
          />
          <TaskSummary
            title="Done"
            count={stats.tasksByStatus.done}
            color="done"
          />
          <TaskSummary
            title="Overdue"
            count={stats.overdueTasks}
            color="overdue"
          />
        </div>
      )}

      <div className="priority-section">
        <h3>Tasks by Priority</h3>
        {stats && (
          <div className="priority-grid">
            <div className="priority-card">
              <h4>High</h4>
              <p className="priority-count">{stats.tasksByPriority.high}</p>
            </div>
            <div className="priority-card">
              <h4>Medium</h4>
              <p className="priority-count">{stats.tasksByPriority.medium}</p>
            </div>
            <div className="priority-card">
              <h4>Low</h4>
              <p className="priority-count">{stats.tasksByPriority.low}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
