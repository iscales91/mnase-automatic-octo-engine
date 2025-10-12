import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Trophy, Users, Sun, CheckCircle } from 'lucide-react';

function SummerSizzle() {
  const token = localStorage.getItem('token');

  const divisions = [
    { age: '9U', description: '4th grade and under', spots: '12 teams' },
    { age: '11U', description: '5th grade and under', spots: '16 teams' },
    { age: '13U', description: '7th grade and under', spots: '16 teams' },
    { age: '15U', description: '9th grade and under', spots: '20 teams' },
    { age: '17U', description: '11th grade and under', spots: '20 teams' }
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
                <Link to="/events/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/events/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/events/winter-wars">Winter Wars Circuit</Link>
                <Link to="/events/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            {token ? (
              <Link to="/dashboard" className="navbar-btn btn-primary">Dashboard</Link>
            ) : (
              <Link to="/" className="navbar-btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '5rem 2rem', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <Sun size={64} style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '4rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Summer Sizzle Circuit
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto 2rem' }}>
            March - July | College Facilities | 5 Divisions
          </p>
          <Button style={{ background: 'white', color: '#f59e0b', padding: '1rem 2.5rem', fontSize: '1.2rem', fontWeight: '600' }}>
            Register Your Team
          </Button>
        </div>
      </section>

      {/* Overview */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <Card style={{ background: '#fffbeb', border: '2px solid #fbbf24' }}>
              <CardHeader>
                <Calendar size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#92400e' }}>Season</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f59e0b' }}>March - July</p>
                <p style={{ color: '#78716c', marginTop: '0.5rem' }}>Monthly tournaments throughout the season</p>
              </CardContent>
            </Card>

            <Card style={{ background: '#fffbeb', border: '2px solid #fbbf24' }}>
              <CardHeader>
                <Trophy size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#92400e' }}>Entry Fee</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f59e0b' }}>$355.32</p>
                <p style={{ color: '#78716c', marginTop: '0.5rem' }}>Per team, per tournament</p>
              </CardContent>
            </Card>

            <Card style={{ background: '#fffbeb', border: '2px solid #fbbf24' }}>
              <CardHeader>
                <MapPin size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#92400e' }}>Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: '1.4rem', fontWeight: '600', color: '#f59e0b' }}>College Facilities</p>
                <p style={{ color: '#78716c', marginTop: '0.5rem' }}>Throughout Minnesota</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Age Divisions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {divisions.map((division, idx) => (
              <div key={idx} style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #fbbf24' }}>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
                  {division.age}
                </div>
                <div style={{ color: '#64748b', marginBottom: '0.5rem' }}>{division.description}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#78716c' }}>{division.spots}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Format & Rules */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Tournament Format
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>Pool Play</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>All teams guaranteed 3-4 games</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Round-robin format within pools</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Seeding based on pool results</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>Championship Bracket</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Single elimination playoffs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Championship and consolation games</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Awards ceremony</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>Professional Standards</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Certified referees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Live stats and scoring</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>College coach attendance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SummerSizzle;