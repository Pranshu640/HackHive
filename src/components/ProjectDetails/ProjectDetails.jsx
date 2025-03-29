import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectDetails.css';
import TodoList from '../TodoList/TodoList';

const ProjectDetails = () => {
  const location = useLocation();
  const idea = location.state?.idea;
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleRegenerateRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/v1/gemini/generate-roadmap',
        { idea },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setRoadmap(response.data.data.roadmap);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!idea) return;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5001/api/v1/gemini/generate-roadmap',
          { idea },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        setRoadmap(response.data.data.roadmap);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate roadmap');
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [idea]);

  if (!idea) {
    return <div className="project-details-error">No project details available</div>;
  }

  return (
    <div className="project-details-container">
      <div className="project-header">
        <h1>{idea.title}</h1>
        <div className="project-metrics">
          <span className="difficulty">Challenge: {idea.challenge}</span>
          <span className="stack-match">Team Match: {idea.stackMatch}%</span>
        </div>
      </div>

      <div className="project-section">
        <h2>Description</h2>
        <p>{idea.description}</p>
      </div>

      {idea.workflow && idea.workflow.length > 0 && (
        <div className="project-section">
          <h2>Development Workflow</h2>
          <ol className="workflow-list">
            {idea.workflow.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {idea.techStack && idea.techStack.length > 0 && (
        <div className="project-section">
          <h2>Technical Stack</h2>
          <div className="tech-stack-grid">
            {idea.techStack.map((tech, index) => (
              <div key={index} className="tech-item">{tech}</div>
            ))}
          </div>
        </div>
      )}

      {idea.features && idea.features.length > 0 && (
        <div className="project-section">
          <h2>Key Features</h2>
          <ul className="features-list">
            {idea.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="loading">Generating roadmap...</div>
      ) : error ? (
        <div className="error">
          {error}
          <button onClick={handleRegenerateRoadmap}>Try Again</button>
        </div>
      ) : roadmap ? (
        <div className="project-section">
          <h2>Project Roadmap</h2>
          <TodoList roadmap={roadmap} />
        </div>
      ) : null}

      {loading && (
        <div className="project-section">
          <h2>Generating Project Roadmap...</h2>
          <p>Please wait while we create a detailed development plan.</p>
        </div>
      )}

      {error && (
        <div className="project-section error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}

      {roadmap && !loading && !error && (
        <>
          <div className="project-section">
            <div className="section-header">
              <h2>Project Roadmap</h2>
              <button 
                className="regenerate-button"
                onClick={handleRegenerateRoadmap}
                disabled={loading}
              >
                {loading ? 'Regenerating...' : 'Regenerate Roadmap'}
              </button>
            </div>
            <div className="roadmap-phases">
              {roadmap.phases && roadmap.phases.length > 0 && roadmap.phases.map((phase, index) => (
                <div key={index} className="roadmap-phase">
                  <h3>{phase.name}</h3>
                  <p>Duration: {phase.duration}</p>
                  <div className="phase-tasks">
                    {phase.tasks && phase.tasks.length > 0 && phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="task">
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="subtasks">
                            <strong>Subtasks:</strong>
                            <ul>
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <li key={subtaskIndex}>{subtask}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="task-meta">
                          <span>Estimated Hours: {task.estimatedHours}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {roadmap.totalDuration && (
            <div className="project-section">
              <h2>Project Timeline</h2>
              <p>Total Duration: {roadmap.totalDuration}</p>
              {roadmap.keyMilestones && roadmap.keyMilestones.length > 0 && (
                <div className="milestones">
                  <h3>Key Milestones</h3>
                  <ul>
                    {roadmap.keyMilestones.map((milestone, index) => (
                      <li key={index}>{milestone}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {roadmap.risksAndMitigations && roadmap.risksAndMitigations.length > 0 && (
            <div className="project-section">
              <h2>Risks and Mitigations</h2>
              <div className="risks-grid">
                {roadmap.risksAndMitigations.map((item, index) => (
                  <div key={index} className="risk-item">
                    <h4>Risk:</h4>
                    <p>{item.risk}</p>
                    <h4>Mitigation:</h4>
                    <p>{item.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectDetails;