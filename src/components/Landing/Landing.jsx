import { useState } from 'react';
import { Link } from 'react-router-dom';
import ShinyText from '../ShinyText/ShinyText';
import Squares from '../Squares/Squares';
import './Landing.css';
import SpotlightCard from '../Card/SpotlightCard';
import RotatingText from '../Tagline/RotatingText';

const Landing = () => {
  const [isAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <div className="landing-container">
      
      <div className="content-container">
        <div className="hero-section">
          <ShinyText text="Welcome to HackHive" disabled={false} speed={3} className="hero-title" />
          <p className="hero-subtitle">Your Ultimate Platform for Hackathon Team Formation and Project Management</p>
        </div>

        <div className="features-section">
            <div className="cards-container">
            <SpotlightCard
              title="AI-Powered Idea Generator"
              content="Turn skills into winning ideas in seconds! Paste the hackathon problem statement, share your team's skills, and let AI generate tailored project ideas that align with your strengths. No more brainstorming struggles—just swipe, select, and start building!"
              buttonText="Get Started"
              className="custom-spotlight-card"
            />
            <SpotlightCard
              title="Automated Roadmap"
              content="From idea to execution, our AI crafts a roadmap with milestones and tasks, tailored to your team's skills. Stay organized, focused, and productive. Win with a clear, AI-driven development path. Relevant rolls also assigned."
              buttonText="Get Started"
              className="custom-spotlight-card"
            /></div>
            <div className="cards-container">
            <SpotlightCard
              title="Swipe-Based Idea Selection"
              content="Empower your team with democratic decisions. Swipe to accept or reject AI ideas, ensuring unanimous agreement. Collective feedback refines suggestions, fostering collaboration and quickly uniting your team behind a project they love to build."
              buttonText="Get Started"
              className="custom-spotlight-card"
            />
            <SpotlightCard
              title="Skill-Based Team Formation"
              content="Form powerful teams fast. AI matches skills to project needs, ensuring balance and efficiency. Skip coordination, focus on building. Maximize potential with AI-driven team formation, tackling challenges confidently."
              buttonText="Get Started"
              className="custom-spotlight-card"
            /></div>
          
        </div>

        <div className="cta-section">
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link to="/login" className="cta-button login">Login</Link>
              <Link to="/signin" className="cta-button signup">Sign Up</Link>
            </div>
          ) : (
            <Link to="/projects" className="cta-button explore">Explore Projects</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;