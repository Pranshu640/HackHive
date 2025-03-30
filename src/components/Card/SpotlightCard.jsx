import { useRef } from "react";
import "./SpotlightCard.css";

const SpotlightCard = ({ title, content, buttonText, className = "", spotlightColor = "rgba(204, 153, 255, 0.3)" }) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    divRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
    >
      <h2 className="card-title">{title}</h2>
      <p className="card-content">{content}</p>
      <button className="card-button">{buttonText}</button>
    </div>
  );
};

export default SpotlightCard;