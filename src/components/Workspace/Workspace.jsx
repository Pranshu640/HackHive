import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Workspace.css';

const Workspace = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [waitlistedIdeas, setWaitlistedIdeas] = useState([]);
  const [reviewedIdeas, setReviewedIdeas] = useState([]);
  const [chosenIdea, setChosenIdea] = useState(null);
  const [reviewingWaitlist, setReviewingWaitlist] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  const fetchTeamDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/teams/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(response.data.data.team);
    } catch (err) {
      console.error('Failed to fetch team details:', err);
      setError('Failed to fetch team details');
    }
  };

  const generateIdeas = async () => {
    if (!prompt.trim() || !team) return;

    setLoading(true);
    setError(null);

    try {
      // Construct the complete prompt with team information
      const teamInfo = team.members.map(member => ({
        name: member.name,
        skills: member.skills.join(', ')
      }));

      const response = await axios.post('http://localhost:5001/api/v1/gemini/generate-ideas', {
        team: teamInfo,
        projectRequirements: prompt
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Get the structured JSON response
      const ideasArray = response.data.data.ideas.map(idea => ({
        title: idea.project_title || 'Untitled Project',
        description: idea.brief_description || '',
        challenge: idea.challenging || 'Medium',
        stackMatch: idea.skill_match || Math.floor(Math.random() * 30) + 70,
        workflow: idea.workflow || [],
        techStack: idea.techStack || [],
        features: idea.key_features || []
      }));

      setIdeas(ideasArray);
      setCurrentIdeaIndex(0);
      setReviewingWaitlist(false);
    } catch (err) {
      console.error('Failed to generate ideas:', err);
      setError('Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkipIdea = () => {
    setReviewedIdeas([...reviewedIdeas, { ...ideas[currentIdeaIndex], status: 'denied' }]);
    
    const nextIndex = currentIdeaIndex + 1;
    if (nextIndex >= ideas.length && !chosenIdea) {
      if (waitlistedIdeas.length > 0) {
        setIdeas(waitlistedIdeas);
        setWaitlistedIdeas([]);
        setCurrentIdeaIndex(0);
        setReviewingWaitlist(true);
      } else {
        generateIdeas();
      }
    } else {
      setCurrentIdeaIndex(nextIndex);
    }
  };
  
  const handleWaitlistIdea = () => {
    if (reviewingWaitlist) return;
    
    setWaitlistedIdeas([...waitlistedIdeas, ideas[currentIdeaIndex]]);
    setReviewedIdeas([...reviewedIdeas, { ...ideas[currentIdeaIndex], status: 'waitlisted' }]);
    
    const nextIndex = currentIdeaIndex + 1;
    setCurrentIdeaIndex(nextIndex);
    
    if (nextIndex >= ideas.length && !chosenIdea) {
      if (waitlistedIdeas.length > 0) {
        setIdeas(waitlistedIdeas);
        setWaitlistedIdeas([]);
        setCurrentIdeaIndex(0);
        setReviewingWaitlist(true);
      }
    }
  };
  
  const handleChooseIdea = () => {
    const selectedIdea = ideas[currentIdeaIndex];
    setChosenIdea(selectedIdea);
    setReviewedIdeas([...reviewedIdeas, { ...selectedIdea, status: 'approved' }]);
    navigate('/project-details', { state: { idea: selectedIdea } });
  };
  
  const renderIdeaCard = (idea) => (
    <div className="idea-card">
      <h3>{idea.title}</h3>
      <p className="description">{idea.description}</p>
      <div className="idea-metrics">
        <span className="difficulty">Challenge: {idea.challenge}</span>
        <span className="stack-match">Team Match: {idea.stackMatch}%</span>
      </div>
      {idea.workflow && idea.workflow.length > 0 && (
        <div className="idea-section">
          <h4>Workflow</h4>
          <ul>
            {idea.workflow.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}
      {idea.techStack && idea.techStack.length > 0 && (
        <div className="idea-section">
          <h4>Tech Stack</h4>
          <div className="tech-tags">
            {idea.techStack.map((tech, i) => (
              <span key={i} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="workspace-container">
      <div className="team-sidebar">
        <h2>Team Members</h2>
        {team && team.members.map(member => (
          <div key={member._id} className="team-member-card">
            <h3>{member.name}</h3>
          </div>
        ))}
      </div>

      <div className="workspace-content">
        <div className="prompt-section">
          <h2>Generate Project Ideas</h2>
          <div className="prompt-box">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your hackathon, event details, and project idea requirements..."
              className="prompt-input"
              rows={4}
            />
            <button
              onClick={generateIdeas}
              disabled={loading || !team}
              className="generate-button"
            >
              {loading ? 'Generating...' : 'Generate Ideas'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="ideas-list">
            {chosenIdea ? (
              renderIdeaCard(chosenIdea)
            ) : (
              ideas.length > 0 && currentIdeaIndex < ideas.length && (
                <>
                  {renderIdeaCard(ideas[currentIdeaIndex])}
                  <div className="idea-actions">
                    <button 
                      className="action-button approve"
                      onClick={handleChooseIdea}
                    >
                      Choose This Idea
                    </button>
                    <button 
                      className="action-button deny"
                      onClick={handleSkipIdea}
                    >
                      Skip
                    </button>
                    {!reviewingWaitlist && (
                      <button 
                        className="action-button waitlist"
                        onClick={handleWaitlistIdea}
                      >
                        Waitlist
                      </button>
                    )}
                  </div>
                </>
              )
            )}
            
            {waitlistedIdeas.length > 0 && !reviewingWaitlist && (
              <div className="waitlisted-ideas">
                <h3>Waitlisted Ideas</h3>
                {waitlistedIdeas.map((idea, index) => (
                  <div key={index} className="waitlisted-idea-card">
                    <h4>{idea.title}</h4>
                    <p>{idea.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;