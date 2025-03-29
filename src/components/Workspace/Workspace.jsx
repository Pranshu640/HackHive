import { useState, useEffect } from 'react';
import axios from 'axios';
import './Workspace.css';

const Workspace = () => {
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

      const completePrompt = {
        team: teamInfo,
        projectRequirements: prompt
      };

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
    } catch (err) {
      console.error('Failed to generate ideas:', err);
      setError('Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  };

//   const calculateStackMatch = (teamSkills, requiredTechStack) => {
//     const matchedSkills = requiredTechStack.filter(tech =>
//       teamSkills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()))
//     );
//     return Math.floor((matchedSkills.length / requiredTechStack.length) * 100);
//   };
  
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
              className='prompt-input'
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
              <div className="idea-card">
                <h3>{chosenIdea.title}</h3>
                <p className="description">{chosenIdea.description}</p>
                <div className="idea-metrics">
                  <span className="difficulty">Challenge: {chosenIdea.challenge}%</span>
                  <span className="stack-match">Team Match: {chosenIdea.stackMatch}%</span>
                </div>
                {chosenIdea.workflow.length > 0 && (
                  <div className="idea-section">
                    <h4>Workflow</h4>
                    <ul>
                      {chosenIdea.workflow.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {chosenIdea.techStack.length > 0 && (
                  <div className="idea-section">
                    <h4>Tech Stack</h4>
                    <div className="tech-tags">
                      {chosenIdea.techStack.map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : ideas.length > 0 && currentIdeaIndex < ideas.length && (
              <div className="idea-card">
                <h3>{ideas[currentIdeaIndex].title}</h3>
                <p className="description">{ideas[currentIdeaIndex].description}</p>
                <div className="idea-metrics">
                  <span className="difficulty">Challenge: {ideas[currentIdeaIndex].challenge}%</span>
                  <span className="stack-match">Team Match: {ideas[currentIdeaIndex].stackMatch}%</span>
                </div>
                {ideas[currentIdeaIndex].workflow.length > 0 && (
                  <div className="idea-section">
                    <h4>Workflow</h4>
                    <ul>
                      {ideas[currentIdeaIndex].workflow.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ideas[currentIdeaIndex].techStack.length > 0 && (
                  <div className="idea-section">
                    <h4>Tech Stack</h4>
                    <div className="tech-tags">
                      {ideas[currentIdeaIndex].techStack.map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="idea-actions">
                  <button 
                    className="action-button approve"
                    onClick={() => {
                      setChosenIdea(ideas[currentIdeaIndex]);
                      setReviewedIdeas([...reviewedIdeas, { ...ideas[currentIdeaIndex], status: 'approved' }]);
                    }}
                  >
                    Choose This Idea
                  </button>
                  <button 
                    className="action-button deny"
                    onClick={() => {
                      setReviewedIdeas([...reviewedIdeas, { ...ideas[currentIdeaIndex], status: 'denied' }]);
                      setCurrentIdeaIndex(prev => prev + 1);
                      if (prev + 1 >= ideas.length && !chosenIdea) {
                        if (waitlistedIdeas.length > 0) {
                          setIdeas(waitlistedIdeas);
                          setWaitlistedIdeas([]);
                          setCurrentIdeaIndex(0);
                          setReviewingWaitlist(true);
                        }
                      }
                    }}
                  >
                    Pass
                  </button>
                  {!reviewingWaitlist && (
                    <button 
                      className="action-button waitlist"
                      onClick={() => {
                        setWaitlistedIdeas([...waitlistedIdeas, ideas[currentIdeaIndex]]);
                        setReviewedIdeas([...reviewedIdeas, { ...ideas[currentIdeaIndex], status: 'waitlisted' }]);
                        setCurrentIdeaIndex(prev => prev + 1);
                      }}
                    >
                      Waitlist
                    </button>
                  )}
                </div>
              </div>
            )}
            {waitlistedIdeas.length > 0 && (
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