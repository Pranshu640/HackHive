import React, { useState, useEffect } from 'react';
import './TodoList.css';

const TodoList = ({ roadmap }) => {
  const [tasks, setTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    estimatedHours: ''
  });

  useEffect(() => {
    if (roadmap?.memberTasks) {
      const initialTasks = {};
      Object.entries(roadmap.memberTasks).forEach(([memberName, memberData]) => {
        initialTasks[memberName] = memberData.todoList.map((task, index) => ({
          id: `${memberName}-${index}`,
          ...task,
          completed: false
        }));
      });
      setTasks(initialTasks);
    }
  }, [roadmap]);

  const handleAddTask = (memberName) => {
    if (newTask.title.trim() === '') return;
    
    setTasks(prev => ({
      ...prev,
      [memberName]: [
        ...prev[memberName],
        {
          id: `${memberName}-${Date.now()}`,
          task: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          estimatedHours: newTask.estimatedHours,
          completed: false
        }
      ]
    }));

    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      estimatedHours: ''
    });
  };

  const handleDeleteTask = (memberName, taskId) => {
    setTasks(prev => ({
      ...prev,
      [memberName]: prev[memberName].filter(task => task.id !== taskId)
    }));
  };

  const handleEditTask = (memberName, task) => {
    setEditingTask({ memberName, task });
  };

  const handleUpdateTask = (memberName, taskId) => {
    setTasks(prev => ({
      ...prev,
      [memberName]: prev[memberName].map(task =>
        task.id === taskId ? { ...editingTask.task } : task
      )
    }));
    setEditingTask(null);
  };

  const handleToggleComplete = (memberName, taskId) => {
    setTasks(prev => ({
      ...prev,
      [memberName]: prev[memberName].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  return (
    <div className="todo-list-container">
      <h2>Team Tasks</h2>
      {Object.entries(tasks).map(([memberName, memberTasks]) => (
        <div key={memberName} className="member-tasks">
          <h3>{memberName}'s Tasks</h3>
          
          <div className="add-task-form">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="number"
              placeholder="Estimated Hours"
              value={newTask.estimatedHours}
              onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
            />
            <button onClick={() => handleAddTask(memberName)}>Add Task</button>
          </div>

          <div className="tasks-list">
            {memberTasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                {editingTask?.task.id === task.id ? (
                  <div className="edit-task-form">
                    <input
                      type="text"
                      value={editingTask.task.task}
                      onChange={(e) => setEditingTask(prev => ({
                        ...prev,
                        task: { ...prev.task, task: e.target.value }
                      }))}
                    />
                    <input
                      type="text"
                      value={editingTask.task.description}
                      onChange={(e) => setEditingTask(prev => ({
                        ...prev,
                        task: { ...prev.task, description: e.target.value }
                      }))}
                    />
                    <select
                      value={editingTask.task.priority}
                      onChange={(e) => setEditingTask(prev => ({
                        ...prev,
                        task: { ...prev.task, priority: e.target.value }
                      }))}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <button onClick={() => handleUpdateTask(memberName, task.id)}>Save</button>
                  </div>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(memberName, task.id)}
                    />
                    <div className="task-content">
                      <h4>{task.task}</h4>
                      <p>{task.description}</p>
                      <span className={`priority ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      {task.estimatedHours && (
                        <span className="hours">{task.estimatedHours}h</span>
                      )}
                    </div>
                    <div className="task-actions">
                      <button onClick={() => handleEditTask(memberName, task)}>Edit</button>
                      <button onClick={() => handleDeleteTask(memberName, task.id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoList;