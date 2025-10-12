import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle, Target } from 'lucide-react';

function Clinics() {
  const token = localStorage.getItem('token');

  const clinics = [
    {
      id: 1,
      title: 'Shooting Clinic',
      description: 'Master your shooting form with our specialized clinic. Focus on mechanics, consistency, and shot selection from all areas of the court.',
      duration: '2 hours',
      frequency: 'Weekly sessions',
      price: 50,
      maxParticipants: 15,
      skills: [
        'Shooting form and mechanics',
        'Footwork and balance',
        'Release consistency',
        'Range development',
        'Game situation shots',
        'Free throw routine'
      ]
    },
    {
      id: 2,
      title: 'Defense & Footwork Clinic',
      description: 'Lock down opponents with proper defensive stance, lateral movement, and positioning techniques. Become a lockdown defender.',
      duration: '2 hours',
      frequency: 'Bi-weekly sessions',
      price: 50,
      maxParticipants: 20,
      skills: [
        'Defensive stance fundamentals',
        'Lateral quickness drills',
        'Closeout techniques',
        'On-ball defense',
        'Help defense positioning',
        'Rebounding fundamentals'
      ]
    },
    {
      id: 3,
      title: 'Ball Handling Clinic',
      description: 'Improve your handles with advanced dribbling drills, crossovers, and ball control exercises. Develop elite ball security.',
      duration: '2 hours',
      frequency: 'Weekly sessions',
      price: 50,
      maxParticipants: 15,
      skills: [
        'Dribbling fundamentals',
        'Crossover variations',
        'Between the legs/behind back',
        'Ball control in traffic',
        'Change of pace moves',
        'Finishing with both hands'
      ]
    },
    {
      id: 4,
      title: 'Post Play Clinic',
      description: 'Dominate in the paint with post moves, footwork, and positioning. Perfect for forwards and centers looking to expand their game.',
      duration: '2 hours',
      frequency: 'Bi-weekly sessions',
      price: 50,
      maxParticipants: 12,
      skills: [
        'Post positioning and sealing',
        'Drop step and spin moves',
        'Hook shot technique',
        'Rebounding positioning',
        'Passing from the post',
        'Face-up game'
      ]
    },
    {
      id: 5,
      title: 'Guard Skills Clinic',
      description: 'Develop complete guard skills including ball handling, passing, court vision, and decision making. Become a floor general.',
      duration: '2.5 hours',
      frequency: 'Weekly sessions',
      price: 60,
      maxParticipants: 16,
      skills: [
        'Advanced ball handling',
        'Court vision development',
        'Pick and roll reads',
        'Passing techniques',
        'Decision making drills',
        'Perimeter shooting'
      ]
    },
    {
      id: 6,
      title: 'Finishing & Scoring Clinic',
      description: 'Learn to score from anywhere on the court. Finishing techniques, floaters, euro steps, and creative scoring moves.',
      duration: '2 hours',
      frequency: 'Weekly sessions',
      price: 50,
      maxParticipants: 18,
      skills: [
        'Layup variations',
        'Floater technique',
        'Euro step and jump stop',
        'Contact finishing',
        'Off-hand development',
        'Reverse layups'
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
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }} data-testid="clinics-title">
            Specialized Clinics
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto' }} data-testid="clinics-subtitle">
            Focused skill development sessions led by expert coaches. Perfect for continuous improvement and targeted training.
          </p>
        </div>
      </section>

      {/* Clinics Grid */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="card-grid">
            {clinics.map((clinic) => (
              <Card key={clinic.id} style={{ borderTop: '4px solid #1e40af' }} data-testid={`clinic-card-${clinic.id}`}>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <CardTitle style={{ fontSize: '1.8rem', color: '#1e40af' }} data-testid={`clinic-title-${clinic.id}`}>
                      {clinic.title}
                    </CardTitle>
                    <Target size={32} style={{ color: '#1e40af' }} />
                  </div>
                  <CardDescription data-testid={`clinic-description-${clinic.id}`}>
                    {clinic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Clock size={18} />
                      <span data-testid={`clinic-duration-${clinic.id}`}>{clinic.duration} per session</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Calendar size={18} />
                      <span data-testid={`clinic-frequency-${clinic.id}`}>{clinic.frequency}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      <strong style={{ color: '#1e293b' }}>Max participants:</strong> {clinic.maxParticipants}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Skills Covered:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {clinic.skills.map((skill, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <CheckCircle size={16} style={{ marginTop: '2px', color: '#1e40af', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.9rem', color: '#475569' }} data-testid={`clinic-skill-${clinic.id}-${idx}`}>
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ 
                    background: '#eff6ff', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #1e40af'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>Per Session:</span>
                      <span style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }} data-testid={`clinic-price-${clinic.id}`}>
                        ${clinic.price}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" style={{ background: '#1e40af' }} data-testid={`clinic-register-${clinic.id}`}>
                    Book Clinic
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

export default Clinics;