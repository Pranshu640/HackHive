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
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    workflow: true,
    techStack: true,
    features: true,
    roadmap: true,
    timeline: true,
    risks: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!idea) return;
      try {
        const token = localStorage.getItem('token');
        // First try to fetch existing project details
        const projectResponse = await axios.get(`http://localhost:5001/api/v1/projects/team`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (projectResponse.data.data.projects) {
          setAvailableProjects(projectResponse.data.data.projects);
          setLoading(false);
          return;
        }

        // If no existing project, generate new roadmap
        const response = await axios.post('http://localhost:5001/api/v1/gemini/generate-roadmap',
          { idea },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        // Save the project with roadmap
        await axios.post('http://localhost:5001/api/v1/projects',
          { 
            ...idea,
            roadmap: response.data.data.roadmap
          },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        setRoadmap(response.data.data.roadmap);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch/generate project details');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [idea]);

  if (!idea) {
    return <div className="project-details-error">No project details available</div>;
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setRoadmap(project.roadmap);
  };

  if (availableProjects.length > 0 && !selectedProject) {
    return (
      <div className="project-selection-container">
        <h2>Available Projects</h2>
        <div className="project-list">
          {availableProjects.map((project) => (
            <div key={project._id} className="project-card" onClick={() => handleProjectSelect(project)}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-metrics">
                <span className="difficulty">Challenge: {project.challenge}</span>
                <span className="stack-match">Team Match: {project.stackMatch}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayProject = selectedProject || idea;

  return (
    <div className="project-details-container">
      <div className="project-header">
        <h1>{displayProject.title}</h1>
        <div className="project-metrics">
          <span className="difficulty">Challenge: {displayProject.challenge}</span>
          <span className="stack-match">Team Match: {displayProject.stackMatch}%</span>
        </div>
      </div>

      <div className="project-section">
        <div className="section-header" onClick={() => toggleSection('description')}>
          <h2>Description</h2>
          <span className={`toggle-icon ${expandedSections.description ? 'expanded' : ''}`}>▼</span>
        </div>
        <div className={`section-content ${expandedSections.description ? 'expanded' : ''}`}>
          <p>{displayProject.description}</p>
        </div>
      </div>

      {displayProject.workflow && displayProject.workflow.length > 0 && (
        <div className="project-section">
          <div className="section-header" onClick={() => toggleSection('workflow')}>
            <h2>Development Workflow</h2>
            <span className={`toggle-icon ${expandedSections.workflow ? 'expanded' : ''}`}>▼</span>
          </div>
          <div className={`section-content ${expandedSections.workflow ? 'expanded' : ''}`}>
            <ol className="workflow-list">
              {displayProject.workflow.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {displayProject.techStack && displayProject.techStack.length > 0 && (
        <div className="project-section">
          <div className="section-header" onClick={() => toggleSection('techStack')}>
            <h2>Technical Stack</h2>
            <span className={`toggle-icon ${expandedSections.techStack ? 'expanded' : ''}`}>▼</span>
          </div>
          <div className={`section-content ${expandedSections.techStack ? 'expanded' : ''}`}>
            <div className="tech-stack-grid">
              {displayProject.techStack.map((tech, index) => (
                <div key={index} className="tech-item">{tech}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {displayProject.features && displayProject.features.length > 0 && (
        <div className="project-section">
          <div className="section-header" onClick={() => toggleSection('features')}>
            <h2>Key Features</h2>
            <span className={`toggle-icon ${expandedSections.features ? 'expanded' : ''}`}>▼</span>
          </div>
          <div className={`section-content ${expandedSections.features ? 'expanded' : ''}`}>
            <ul className="features-list">
              {displayProject.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
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
            <div className="section-header" onClick={() => toggleSection('roadmap')}>
              <h2>Project Roadmap</h2>
              <div className="header-actions">
                <button 
                  className="regenerate-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerateRoadmap();
                  }}
                  disabled={loading}
                >
                  {loading ? 'Regenerating...' : 'Regenerate Roadmap'}
                </button>
                <span className={`toggle-icon ${expandedSections.roadmap ? 'expanded' : ''}`}>▼</span>
              </div>
            </div>
            <div className={`section-content ${expandedSections.roadmap ? 'expanded' : ''}`}>
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
          </div>

          {roadmap.totalDuration && (
            <div className="project-section">
              <div className="section-header" onClick={() => toggleSection('timeline')}>
                <h2>Project Timeline</h2>
                <span className={`toggle-icon ${expandedSections.timeline ? 'expanded' : ''}`}>▼</span>
              </div>
              <div className={`section-content ${expandedSections.timeline ? 'expanded' : ''}`}>
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
            </div>
          )}

          {roadmap.risksAndMitigations && roadmap.risksAndMitigations.length > 0 && (
            <div className="project-section">
              <div className="section-header" onClick={() => toggleSection('risks')}>
                <h2>Risks and Mitigations</h2>
                <span className={`toggle-icon ${expandedSections.risks ? 'expanded' : ''}`}>▼</span>
              </div>
              <div className={`section-content ${expandedSections.risks ? 'expanded' : ''}`}>
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectDetails;