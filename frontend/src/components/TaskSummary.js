import React from 'react';
import './TaskSummary.css';

const TaskSummary = ({ title, count, color }) => {
  return (
    <div className={`task-summary ${color}`}>
      <h3>{title}</h3>
      <p className="count">{count}</p>
    </div>
  );
};

export default TaskSummary;