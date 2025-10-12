import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';

function Camps() {
  const token = localStorage.getItem('token');

  const camps = [
    {
      id: 1,
      title: 'Youth Basketball Camp',
      description: 'Summer basketball camp for ages 10-16. Professional coaching, skill development, and competitive games in a fun environment.',
      duration: '5-day intensive',
      ageRange: '10-16',
      price: 200,
      schedule: 'Summer sessions',
      included: [
        'Professional coaching staff',
        'Skill development sessions',
        'Competitive games',
        'Team building activities',
        'Camp t-shirt and water bottle',
        'End of camp showcase'
      ]
    },
    {
      id: 2,
      title: 'Elite Skills Camp',
      description: 'Advanced camp for competitive players focusing on advanced techniques, game strategy, and mental toughness.',
      duration: '3-day intensive',
      ageRange: '13-18',
      price: 350,
      schedule: 'Multiple sessions throughout year',
      included: [
        'Advanced skill training',
        'Game strategy sessions',
        'Mental toughness coaching',
        'Video analysis',
        'College prep guidance',
        'Elite camp gear package'
      ]
    },
    {
      id: 3,
      title: 'Holiday Break Camp',
      description: 'Stay active during school breaks with our holiday camps. Fun drills, games, and skill development in a festive atmosphere.',
      duration: '3-day sessions',
      ageRange: '8-14',
      price: 175,
      schedule: 'Winter, Spring, and Summer breaks',
      included: [
        'Fun skill drills',
        'Holiday-themed games',
        'Prizes and giveaways',
        'Snacks provided',
        'Holiday camp shirt',
        'Family showcase event'
      ]
    },
    {
      id: 4,
      title: 'Fundamentals Camp',
      description: 'Perfect for beginners learning the basics. Focus on fundamental skills, rules, sportsmanship, and love of the game.',
      duration: '4-day program',
      ageRange: '7-12',
      price: 150,
      schedule: 'Monthly sessions',
      included: [
        'Basic skills instruction',
        'Rules and game understanding',
        'Sportsmanship training',
        'Age-appropriate drills',
        'Participation certificate',
        'Beginner basketball'
      ]
    },
    {
      id: 5,
      title: 'Position-Specific Camp',
      description: 'Specialized training for guards, forwards, and centers. Master your position with expert coaching and position-specific drills.',
      duration: '3-day intensive',
      ageRange: '12-17',
      price: 275,
      schedule: 'Quarterly sessions',
      included: [
        'Position-specific coaching',
        'Role-focused drills',
        'Game situation training',
        'Film study sessions',
        'Position playbook',
        'Performance evaluation'
      ]
    },
    {
      id: 6,
      title: 'Pre-Season Boot Camp',
      description: 'Get ready for the season with intense conditioning, skill sharpening, and team building. Perfect for school team preparation.',
      duration: '5-day intensive',
      ageRange: '11-18',
      price: 225,
      schedule: 'August/September and November',
      included: [
        'Conditioning program',
        'Skill refresher sessions',
        'Team building exercises',
        'Scrimmages and games',
        'Season prep materials',
        'Performance baseline testing'
      ]
    }
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" data-testid="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
            <Link to="/programs" className="navbar-link" data-testid="nav-programs-link">Programs</Link>
            <Link to="/memberships" className="navbar-link" data-testid="nav-memberships-link">Memberships</Link>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps" data-testid="nav-camps-link">Camps</Link>
                <Link to="/clinics" data-testid="nav-clinics-link">Clinics</Link>
                <Link to="/workshops" data-testid="nav-workshops-link">Workshops</Link>
              </div>
            </div>
            <Link to="/events" className="navbar-link" data-testid="nav-events-link">Events</Link>
            <Link to="/facilities" className="navbar-link" data-testid="nav-facilities-link">Facilities</Link>
            {token ? (
              <Link to="/dashboard" className="navbar-btn btn-primary" data-testid="nav-dashboard-link">Dashboard</Link>
            ) : (
              <Link to="/" className="navbar-btn btn-primary" data-testid="nav-home-link">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }} data-testid="camps-title">
            Basketball Camps
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto' }} data-testid="camps-subtitle">
            Intensive multi-day programs designed to elevate skills, build confidence, and create lasting memories
          </p>
        </div>
      </section>

      {/* Camps Grid */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="card-grid">
            {camps.map((camp) => (
              <Card key={camp.id} style={{ borderTop: '4px solid #dc2626' }} data-testid={`camp-card-${camp.id}`}>
                <CardHeader>
                  <CardTitle style={{ fontSize: '1.8rem', color: '#991b1b' }} data-testid={`camp-title-${camp.id}`}>
                    {camp.title}
                  </CardTitle>
                  <CardDescription data-testid={`camp-description-${camp.id}`}>
                    {camp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Clock size={18} />
                      <span data-testid={`camp-duration-${camp.id}`}>{camp.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Users size={18} />
                      <span data-testid={`camp-age-${camp.id}`}>Ages {camp.ageRange}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Calendar size={18} />
                      <span data-testid={`camp-schedule-${camp.id}`}>{camp.schedule}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>What's Included:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {camp.included.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <CheckCircle size={16} style={{ marginTop: '2px', color: '#16a34a', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.9rem', color: '#475569' }} data-testid={`camp-include-${camp.id}-${idx}`}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ 
                    background: '#fef2f2', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc2626'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>Camp Fee:</span>
                      <span style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }} data-testid={`camp-price-${camp.id}`}>
                        ${camp.price}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" style={{ background: '#dc2626' }} data-testid={`camp-register-${camp.id}`}>
                    Register for Camp
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Camps;