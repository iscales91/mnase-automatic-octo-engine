import React from 'react';
import { Link } from 'react-router-dom';
import AdvancedCalendar from '@/components/AdvancedCalendar';

function CalendarPage() {
  const token = localStorage.getItem('token');

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand" data-testid="navbar-brand">
              <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
            </Link>
            <button 
              className="navbar-hamburger"
              onClick={() => {
                const navLinks = document.querySelector('.navbar-links');
                if (navLinks) {
                  navLinks.classList.toggle('collapsed');
                  navLinks.classList.toggle('expanded');
                }
              }}
              aria-label="Toggle navigation"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="navbar-links collapsed">
            <Link to="/programs" className="navbar-link">Programs</Link>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Memberships ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/memberships/individual">Individual/Family</Link>
                <Link to="/memberships/team">Team/Group</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps">Camps</Link>
                <Link to="/clinics">Clinics</Link>
                <Link to="/workshops">Workshops</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Events ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/calendar" data-testid="nav-calendar-link">Calendar</Link>
                <Link to="/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars">Winter Wars Circuit</Link>
                <Link to="/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            <Link to="/news" className="navbar-link">News</Link>
            <Link to="/about" className="navbar-link">About</Link>
            <Link to="/faq" className="navbar-link">FAQ</Link>
            <Link to="/shop" className="navbar-link">Shop</Link>
            {token ? (
              <>
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }} className="navbar-btn btn-secondary">Logout</button>
              </>
            ) : (
              <Link to="/" className="navbar-btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '4rem 2rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Events Calendar
          </h1>
          <p style={{ fontSize: '1.3rem', color: '#94a3b8' }}>
            View all upcoming events, programs, and activities
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <div style={{ padding: '3rem 2rem', background: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <AdvancedCalendar />
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
