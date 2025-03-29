import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/v1/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserProfile(response.data.data.user);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!userProfile) return <div className="profile-error">No profile data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-change'));
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
      
      <div className="profile-section">
        <h2>Personal Information</h2>
        <div className="profile-info">
          <p><strong>Name:</strong> {userProfile.name}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2>Skills</h2>
        <div className="profile-skills">
          {userProfile.skills && userProfile.skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h2>Projects</h2>
        <div className="profile-projects">
          {userProfile.projects && userProfile.projects.map((project, index) => (
            <div key={index} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h2>Competitive Experience</h2>
        <div className="profile-experience">
          {userProfile.competitiveExperience && userProfile.competitiveExperience.map((exp, index) => (
            <div key={index} className="experience-card">
              <h3>{exp.platform}</h3>
              <p><strong>Username:</strong> {exp.username}</p>
              <p><strong>Achievements:</strong></p>
              <ul>
                {exp.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;