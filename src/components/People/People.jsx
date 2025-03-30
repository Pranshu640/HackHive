import { useState, useEffect } from 'react';
import axios from 'axios';
import './People.css';
import './Button.css';

const People = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/v1/users/all');
        setUsers(response.data.data.users);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="people-loading">Loading users...</div>;
  }

  if (error) {
    return <div className="people-error">{error}</div>;
  }

  return (
    <div className="people-container">
      <h1>People</h1>
      <div className="people-grid">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            {user.skills && (
              <div className="skills">
                {user.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            )}
            {user.projects && (
              <div className="projects">
                <h4>Projects</h4>
                <ul>
                  {user.projects.map((project, index) => (
                    <li key={index}>{project}</li>
                  ))}
                </ul>
              </div>
            )}
            {user.competitiveExperience && (
              <div className="experience">
                <h4>Competitive Experience</h4>
                <p>{user.competitiveExperience}</p>
              </div>
            )}
            <button className="custom-button">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default People;