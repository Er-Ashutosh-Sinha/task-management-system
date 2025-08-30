import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';
import TaskItem from '../components/TaskItem';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalTasks: 0,
  });

  const { user } = useAuth();

  // Memoize fetchTasks so it doesn't change every render
  const fetchTasks = useCallback(async () => {
    try {
      const token = user?.token || localStorage.getItem('token');
      const filterParams = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Remove empty filter values
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === '') {
          delete filterParams[key];
        }
      });

      const data = await taskService.getTasks(token, filterParams);
      setTasks(data.tasks);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination.totalPages,
        totalTasks: data.pagination.totalTasks,
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [user, filters, pagination.page, pagination.limit]);

  // ✅ useEffect now depends on fetchTasks
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = e => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = newPage => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleDeleteTask = taskId => {
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  if (loading) {
    return <div className="task-list-container">Loading...</div>;
  }

  if (error) {
    return <div className="task-list-container">Error: {error}</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h1>Tasks</h1>
        <Link to="/tasks/new" className="btn btn-primary create-task-link">
          Create Task
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="form-group">
          <input
            type="text"
            name="search"
            placeholder="Search by Title/Description"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="form-group">
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map(task => (
            <TaskItem key={task._id} task={task} onDelete={handleDeleteTask} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-primary btn-sm"
          >
            ⟵
          </button>
          <span>
            {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-primary btn-sm"
          >
            ⟶
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
