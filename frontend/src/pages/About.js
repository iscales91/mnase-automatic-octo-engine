import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function About() {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
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
                <Link to="/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars">Winter Wars Circuit</Link>
                <Link to="/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            <Link to="/about" className="navbar-link">About</Link>
            <Link to="/contact" className="navbar-link">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '6rem 2rem 4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1.5rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            About MNASE Basketball
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
            Building champions on and off the court through mentorship, networking, athletics, support, and experience.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>🎯</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>Our Mission</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                To develop well-rounded athletes who excel in basketball while building character, leadership, and community connections that last a lifetime.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>👁️</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>Our Vision</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                To be the premier youth basketball organization in Minnesota, known for developing talent, fostering sportsmanship, and creating opportunities for all athletes.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>⭐</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>Our Values</h3>
              <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Excellence, Integrity, Teamwork, Respect, and Community. These core values guide everything we do at MNASE Basketball League.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>
            Our Story
          </h2>
          <div style={{ fontSize: '1.2rem', lineHeight: '2', color: '#475569' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Founded with a passion for basketball and a commitment to youth development, MNASE Basketball League has grown into a cornerstone of the Minnesota basketball community. What started as a small group of dedicated coaches and enthusiastic players has evolved into a comprehensive organization offering programs for athletes of all ages and skill levels.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              The name MNASE represents our core pillars: <strong>M</strong>entorship, <strong>N</strong>etworking, <strong>A</strong>thletics, <strong>S</strong>upport, and <strong>E</strong>xperience. These aren't just words to us – they're the foundation of every program we offer and every interaction we have with our athletes and families.
            </p>
            <p>
              Today, we serve hundreds of young athletes through our travel programs, seasonal leagues, camps, clinics, and tournaments. We're proud of the players who have gone on to compete at the high school, college, and even professional levels, but we're equally proud of the life skills, friendships, and memories created along the way.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 2rem', background: '#1e293b', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700', color: '#dc2626' }}>500+</div>
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', marginTop: '0.5rem' }}>Active Athletes</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700', color: '#dc2626' }}>50+</div>
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', marginTop: '0.5rem' }}>Tournaments Hosted</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700', color: '#dc2626' }}>15+</div>
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', marginTop: '0.5rem' }}>Years of Excellence</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700', color: '#dc2626' }}>100+</div>
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', marginTop: '0.5rem' }}>College Athletes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 2rem', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
            Join the MNASE Family
          </h2>
          <p style={{ fontSize: '1.3rem', color: '#64748b', marginBottom: '2rem' }}>
            Whether you're looking to compete at the highest level or just starting your basketball journey, we have a place for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/programs">
              <Button style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: 'none'
              }}>
                Explore Programs
              </Button>
            </Link>
            <Link to="/contact">
              <Button style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '1.2rem',
                background: 'transparent',
                border: '2px solid #dc2626',
                color: '#dc2626'
              }}>
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;