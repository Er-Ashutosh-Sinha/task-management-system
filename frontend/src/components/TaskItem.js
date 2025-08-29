import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';
import './TaskItem.css';

const TaskItem = ({ task, onDelete }) => {
  const { user } = useAuth();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = user?.token || localStorage.getItem('token');
        await taskService.deleteTask(token, task._id);

        if (onDelete) {
          onDelete(task._id);
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusClass = status => {
    switch (status) {
      case 'todo':
        return 'status-todo';
      case 'in-progress':
        return 'status-in-progress';
      case 'done':
        return 'status-done';
      default:
        return '';
    }
  };

  const getPriorityClass = priority => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <Link to={`/tasks/${task._id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <span className={`task-status ${getStatusClass(task.status)}`}>
          {task.status}
        </span>
        <span className={`task-priority ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
        <span className="task-due-date">Due: {formatDate(task.dueDate)}</span>
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
