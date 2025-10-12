import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle, Brain } from 'lucide-react';

function Workshops() {
  const token = localStorage.getItem('token');

  const workshops = [
    {
      id: 1,
      title: 'Mental Toughness Workshop',
      description: 'Develop the mental game that separates good players from great ones. Learn visualization, focus techniques, and pressure management strategies.',
      duration: 'Half-day (4 hours)',
      frequency: 'Monthly',
      price: 75,
      maxParticipants: 25,
      topics: [
        'Visualization techniques',
        'Pre-game mental preparation',
        'Managing pressure situations',
        'Building confidence',
        'Overcoming adversity',
        'Goal setting strategies'
      ]
    },
    {
      id: 2,
      title: 'Film Study Workshop',
      description: 'Learn to analyze game film like the pros. Understand offensive and defensive schemes, recognize patterns, and improve basketball IQ.',
      duration: '3-hour session',
      frequency: 'Bi-monthly',
      price: 60,
      maxParticipants: 30,
      topics: [
        'How to break down film',
        'Offensive scheme recognition',
        'Defensive coverage identification',
        'Individual player analysis',
        'Scouting opponent tendencies',
        'Self-evaluation techniques'
      ]
    },
    {
      id: 3,
      title: 'College Recruitment Workshop',
      description: 'Navigate the college recruitment process with confidence. Create highlight reels, contact coaches effectively, and prepare for showcases.',
      duration: 'Full-day (6 hours)',
      frequency: 'Quarterly',
      price: 100,
      maxParticipants: 40,
      topics: [
        'Understanding NCAA/NAIA divisions',
        'Creating effective highlight reels',
        'Contacting college coaches',
        'Preparing for showcases',
        'Academic eligibility requirements',
        'Scholarship negotiation basics'
      ]
    },
    {
      id: 4,
      title: 'Strength & Conditioning Workshop',
      description: 'Learn proper training techniques for basketball-specific fitness. Injury prevention, nutrition basics, and off-season conditioning programs.',
      duration: 'Half-day (4 hours)',
      frequency: 'Bi-monthly',
      price: 65,
      maxParticipants: 20,
      topics: [
        'Basketball-specific exercises',
        'Injury prevention strategies',
        'Proper warm-up/cool-down',
        'Nutrition for athletes',
        'Off-season training plans',
        'Recovery techniques'
      ]
    },
    {
      id: 5,
      title: 'Leadership & Communication Workshop',
      description: 'Develop leadership skills on and off the court. Learn effective communication, team building, and how to be a positive influence.',
      duration: 'Half-day (4 hours)',
      frequency: 'Monthly',
      price: 70,
      maxParticipants: 30,
      topics: [
        'Leadership principles',
        'Effective communication skills',
        'Team building exercises',
        'Conflict resolution',
        'Leading by example',
        'Motivating teammates'
      ]
    },
    {
      id: 6,
      title: 'Parent Education Workshop',
      description: 'For parents and guardians to understand youth basketball development, supporting your athlete, and navigating the competitive landscape.',
      duration: '2-hour session',
      frequency: 'Quarterly',
      price: 25,
      maxParticipants: 50,
      topics: [
        'Age-appropriate development',
        'Supporting your athlete',
        'Understanding club/AAU basketball',
        'College recruitment overview',
        'Balancing sports and academics',
        'Identifying quality programs'
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
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }} data-testid="workshops-title">
            Development Workshops
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto' }} data-testid="workshops-subtitle">
            Educational sessions focusing on mental game, basketball IQ, college prep, and holistic player development.
          </p>
        </div>
      </section>

      {/* Workshops Grid */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="card-grid">
            {workshops.map((workshop) => (
              <Card key={workshop.id} style={{ borderTop: '4px solid #7c3aed' }} data-testid={`workshop-card-${workshop.id}`}>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <CardTitle style={{ fontSize: '1.8rem', color: '#7c3aed' }} data-testid={`workshop-title-${workshop.id}`}>
                      {workshop.title}
                    </CardTitle>
                    <Brain size={32} style={{ color: '#7c3aed' }} />
                  </div>
                  <CardDescription data-testid={`workshop-description-${workshop.id}`}>
                    {workshop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Clock size={18} />
                      <span data-testid={`workshop-duration-${workshop.id}`}>{workshop.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Calendar size={18} />
                      <span data-testid={`workshop-frequency-${workshop.id}`}>{workshop.frequency}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      <strong style={{ color: '#1e293b' }}>Max participants:</strong> {workshop.maxParticipants}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Topics Covered:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {workshop.topics.map((topic, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <CheckCircle size={16} style={{ marginTop: '2px', color: '#7c3aed', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.9rem', color: '#475569' }} data-testid={`workshop-topic-${workshop.id}-${idx}`}>
                            {topic}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ 
                    background: '#f5f3ff', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #7c3aed'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>Workshop Fee:</span>
                      <span style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed' }} data-testid={`workshop-price-${workshop.id}`}>
                        ${workshop.price}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" style={{ background: '#7c3aed' }} data-testid={`workshop-register-${workshop.id}`}>
                    Reserve Spot
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

export default Workshops;
