import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/backButton.css';

const BackButton = ({ fallback = '/dashboard', label = '← Back' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there's history, go back; else navigate to fallback
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button className="back-button" onClick={handleBack} aria-label="Go back">
      {label}
    </button>
  );
};

export default BackButton;
