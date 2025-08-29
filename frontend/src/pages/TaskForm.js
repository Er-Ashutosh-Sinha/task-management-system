import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';
import './TaskForm.css';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split('T')[0], // Set next day as default
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchTask(id);
    }
  }, [id]);

  const fetchTask = async taskId => {
    try {
      const token = user?.token || localStorage.getItem('token');
      const task = await taskService.getTaskById(token, taskId);

      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags ? task.tags.join(', ') : '',
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch task');
    }
  };

  const { title, description, status, priority, dueDate, tags } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = user?.token || localStorage.getItem('token');
      const taskData = {
        ...formData,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
      };

      if (isEdit) {
        await taskService.updateTask(token, id, taskData);
      } else {
        await taskService.createTask(token, taskData);
      }

      navigate('/tasks');
    } catch (err) {
      setError(
        err.message ||
          (isEdit ? 'Failed to update task' : 'Failed to create task')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <h1>{isEdit ? 'Edit Task' : 'Create Task'}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="4"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={onChange}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={priority}
              onChange={onChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={dueDate}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tags}
            onChange={onChange}
            placeholder="e.g., work, urgent, personal"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
                ? 'Update Task'
                : 'Create Task'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
