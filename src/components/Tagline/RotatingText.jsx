import React, { useState, useEffect } from "react";
import "./RotatingText.css";

const RotatingText = ({ texts, interval = 2000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <div className="rotating-text-container">
      {/* Static text outside the box */}
      <span className="static-text">Spark</span>
      
      {/* Purple Box */}
      <div className="rotating-box">
        {texts.map((text, i) => (
          <span 
            key={i} 
            className={`rotating-word ${i === index ? "visible" : "hidden"}`}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RotatingText;


