import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SignIn from './components/SignIn/SignIn'
import Login from './components/Login/Login'
import Profile from './components/Profile/Profile'
import Ideas from './components/Ideas/Ideas'
import './components/SignIn/SignIn.css'
import Workspace from './components/Workspace/Workspace'
import ProjectDetails from './components/ProjectDetails/ProjectDetails'
import Projects from './components/Projects/Projects'
import People from './components/People/People'
import GooeyNav from './components/Navbar/navbar'
import Squares from './components/Squares/Squares'
import Landing from './components/Landing/Landing'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
    }
    
    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom auth-change events (from current tab/window)
    window.addEventListener('auth-change', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleStorageChange)
    }
  }, [])

  return (
    <Router>
      <div className="app-container">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <Squares
            speed={0.3}
            squareSize={50}
            direction="diagonal"
            borderColor="rgba(255, 255, 255, 0.09)"
            hoverFillColor="rgba(204, 153, 255, 0.5)"
          />
        </div>
        <GooeyNav />
        <Routes>
          <Route path="/signin" element={!isAuthenticated ? <SignIn /> : <Navigate to="/profile" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/profile" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/ideas" element={isAuthenticated ? <Ideas /> : <Navigate to="/login" />} />
          <Route path="/workspace" element={isAuthenticated ? <Workspace /> : <Navigate to="/login" />} />
          <Route path="/project-details" element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/people" element={<People />} />
          <Route path="/" element={<Landing />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
