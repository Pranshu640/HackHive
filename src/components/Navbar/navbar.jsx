import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './navbar.css';
import ShinyText from '../ShinyText/ShinyText';

const GooeyNav = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <div className="gooey-nav-container">
      <nav>
        <div className="nav-left">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <ShinyText text="HackHive" disabled={false} speed={3} className="custom-class" />
          </Link>
        </div>
        <div className="nav-center">
          <ul>
            <li
              className={activeTab === "Home" ? "active" : ""}
              onClick={() => handleClick("Home")}
            >
              <Link to="/">Home</Link>
            </li>
            <li
              className={activeTab === "Projects" ? "active" : ""}
              onClick={() => handleClick("Projects")}
            >
              <Link to="/projects">Projects</Link>
            </li>
            <li
              className={activeTab === "Workspace" ? "active" : ""}
              onClick={() => handleClick("Workspace")}
            >
              <Link to="/workspace">Workspace</Link>
            </li>
            <li
              className={activeTab === "People" ? "active" : ""}
              onClick={() => handleClick("People")}
            >
              <Link to="/people">People</Link>
            </li>
          </ul>
        </div>
        <div className="nav-right">
          <ul>
            {isAuthenticated ? (
              <>
                <li
                  className={`profile-btn ${activeTab === "Profile" ? "active" : ""}`}
                  onClick={() => handleClick("Profile")}
                >
                  <Link to="/profile">Profile</Link>
                </li>
                <li
                  className="auth-btn"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </>
            ) : (
              <>
                <li
                  className="auth-btn"
                  onClick={() => navigate('/login')}
                >
                  Login
                </li>
                <li
                  className="auth-btn"
                  onClick={() => navigate('/signin')}
                >
                  Sign Up
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default GooeyNav;