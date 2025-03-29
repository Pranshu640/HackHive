import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Ideas.css';
import TeamFormation from '../TeamFormation/TeamFormation';

const Ideas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch ideas');
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [navigate]);

  if (loading) return <div className="ideas-loading">Loading...</div>;
  if (error) return <div className="ideas-error">{error}</div>;

  return (
    <div className="ideas-container">
      <div className="ideas-header">
        <h1 className="ideas-title">Ideas</h1>
      </div>
      <div className="ideas-content">
        <TeamFormation />
      </div>
    </div>
  );
};

export default Ideas;