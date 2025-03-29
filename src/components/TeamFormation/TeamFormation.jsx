import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamFormation.css';

const TeamDetails = ({ team }) => (
  <div className="team-details">
    <h2>Your Team</h2>
    <div className="team-info">
      <h3>{team.name}</h3>
      <p>{team.description}</p>
      <div className="team-members">
        <h4>Team Members</h4>
        {team.members.map(member => (
          <div key={member._id} className="member-card">
            <h5>{member.name}</h5>
            <p>{member.email}</p>
            <div className="member-skills">
              {member.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
            {member.projects && (
              <div className="member-projects">
                <h6>Projects</h6>
                <ul>
                  {member.projects.map((project, index) => (
                    <li key={index}>{project}</li>
                  ))}
                </ul>
              </div>
            )}
            {member.competitiveExperience && (
              <div className="member-experience">
                <h6>Competitive Experience</h6>
                <p>{member.competitiveExperience}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TeamFormation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null);

  // Fetch received team requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/team-requests/received', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to fetch requests');
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/teams/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(response.data.data.team);
    } catch (err) {
      console.error('Failed to fetch team details:', err);
      // Don't set error here as the user might not be in a team yet
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTeamDetails();
  }, []);

  // Search users
  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/v1/team-requests/search?query=${encodeURIComponent(searchQuery)}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data.data.users);
    } catch (err) {
      console.error('Failed to search users:', err);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Send team request
  const sendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/v1/team-requests/send', 
        { receiverId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, requestSent: true }
          : user
      ));
    } catch (err) {
      console.error('Failed to send request:', err);
      setError('Failed to send request');
    }
  };

  // Handle team request
  const handleRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/v1/team-requests/handle',
        { requestId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchRequests(); // Refresh requests list
      if (action === 'accepted') {
        await fetchTeamDetails(); // Refresh team details after accepting
      }
    } catch (err) {
      console.error('Failed to handle request:', err);
      setError('Failed to handle request');
    }
  };

  return (
    <div className="team-formation-container">
      {team ? (
        <>
          <TeamDetails team={team} />
        </>
      ) : (
        <div className="search-section">
          <h2>Find Team Members</h2>
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email"
            />
            <button onClick={searchUsers} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="users-list">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user._id} className="user-card">
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <div className="skills">
                      {user.skills && user.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => sendRequest(user._id)}
                    disabled={user.requestSent}
                    className={user.requestSent ? 'sent' : ''}
                  >
                    {user.requestSent ? 'Request Sent' : 'Send Request'}
                  </button>
                </div>
              ))
            ) : searchQuery.trim() && !loading ? (
              <p className="no-results">No users found. Try a different search term.</p>
            ) : null}
          </div>
        </div>
        
      )}

      {requests.length > 0 && (
        <div className="requests-section">
          <h2>Team Requests</h2>
          <div className="requests-list">
            {requests.map(request => (
              <div key={request._id} className="request-card">
                <div className="request-info">
                  <h3>{request.sender.name}</h3>
                  <p>{request.sender.email}</p>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleRequest(request._id, 'accepted')}
                    className="accept"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(request._id, 'rejected')}
                    className="reject"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
                <div className="workspace-nav">
            <button
              className="workspace-button"
              onClick={() => navigate('/workspace')}
            >
              Go to Workspace
            </button>
          </div>
    </div>
  );
};

export default TeamFormation;