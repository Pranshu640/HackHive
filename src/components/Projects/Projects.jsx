import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/v1/projects/all');
        
        setProjects(response.data.data.projects);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    navigate('/project-details', { state: { idea: project } });
  };

  if (loading) {
    return <div className="projects-loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="projects-error">{error}</div>;
  }

  if (!projects || projects.length === 0) {
    return <div className="no-projects">No projects found for your team.</div>;
  }

  return (
    <div className="projects-container">
      <h1>Team Projects</h1>
      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project._id}
            className="project-card"
            onClick={() => handleProjectClick(project)}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-metrics">
              <span className="difficulty">Challenge: {project.challenge}</span>
              <span className="stack-match">Team Match: {project.stackMatch}%</span>
            </div>
            {project.techStack && (
              <div className="tech-stack">
                {project.techStack.slice(0, 3).map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="tech-tag">+{project.techStack.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;