import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function BackButton({ className = '', style = {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page if no history
      navigate('/');
    }
  };

  // Don't show back button on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={handleBack}
      className={`back-button ${className}`}
      style={{
        position: 'fixed',
        top: '80px',
        left: '20px',
        zIndex: 1000,
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
      }}
      aria-label="Go back"
    >
      <ArrowLeft size={24} />
    </button>
  );
}

export default BackButton;
