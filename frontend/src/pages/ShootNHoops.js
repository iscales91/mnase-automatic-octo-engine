import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar, MapPin, Users, Star } from 'lucide-react';

function ShootNHoops() {
  const token = localStorage.getItem('token');

  const tournaments = [
    {
      id: 1,
      name: 'Summer Sizzle Circuit',
      tagline: 'Elite Competition Meets Summer Heat',
      season: 'March - July',
      divisions: ['9U', '11U', '13U', '15U', '17U'],
      venues: 'College Facilities Across Minnesota',
      feePerTournament: 355.32,
      description: 'Our premier summer tournament circuit brings together the best teams from across the region to compete at college facilities.',
      highlights: [
        'Play at college-level facilities',
        'Multiple division options',
        'Professional referees',
        'Live stats tracking',
        'Championship trophies & awards',
        'College coach attendance'
      ],
      link: '/events/summer-sizzle',
      color: '#f59e0b'
    },
    {
      id: 2,
      name: 'Winter Wars Circuit',
      tagline: 'Indoor Competition at Its Finest',
      season: 'October - February',
      divisions: ['4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'],
      venues: 'St. Paul Parks Recreation Centers',
      feePerTournament: 198.75,
      description: 'Intense winter circuit featuring pool play format at premier St. Paul Parks facilities.',
      highlights: [
        'Pool play tournament format',
        'St. Paul Parks facilities',
        '4-team limit per tournament',
        'Affordable entry fees',
        'Winter championship series',
        'Team skill development focus'
      ],
      link: '/events/winter-wars',
      color: '#3b82f6'
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
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Memberships ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/memberships/individual" data-testid="nav-individual-memberships-link">Individual/Family</Link>
                <Link to="/memberships/team" data-testid="nav-team-memberships-link">Team/Group</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps" data-testid="nav-camps-link">Camps</Link>
                <Link to="/clinics" data-testid="nav-clinics-link">Clinics</Link>
                <Link to="/workshops" data-testid="nav-workshops-link">Workshops</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Events ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/events/shoot-n-hoops" data-testid="nav-shoot-n-hoops-link">Shoot N HOOPS</Link>
                <Link to="/events/summer-sizzle" data-testid="nav-summer-sizzle-link">Summer Sizzle Circuit</Link>
                <Link to="/events/winter-wars" data-testid="nav-winter-wars-link">Winter Wars Circuit</Link>
                <Link to="/events/media-gallery" data-testid="nav-media-gallery-link">Media/Video Gallery</Link>
              </div>
            </div>
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
        padding: '5rem 2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏀</div>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }} data-testid="shoot-n-hoops-title">
            Shoot N HOOPS
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            opacity: 0.95, 
            maxWidth: '900px', 
            margin: '0 auto 2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }} data-testid="shoot-n-hoops-subtitle">
            MNASE's Premier Tournament Series - Where Competition Meets Excellence
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events/summer-sizzle">
              <Button style={{ 
                background: 'white', 
                color: '#dc2626', 
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600'
              }} data-testid="summer-sizzle-btn">
                Summer Sizzle Circuit
              </Button>
            </Link>
            <Link to="/events/winter-wars">
              <Button style={{ 
                background: 'transparent', 
                color: 'white', 
                border: '2px solid white',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600'
              }} data-testid="winter-wars-btn">
                Winter Wars Circuit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Shoot N HOOPS */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
              About Shoot N HOOPS
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '800px', margin: '0 auto' }}>
              Our tournament brand brings together competitive youth basketball teams for high-quality events throughout the year. 
              From premier summer circuits to intense winter competitions, Shoot N HOOPS is where champions are made.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9ff', borderRadius: '12px' }}>
              <Trophy size={48} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                Championship Format
              </h3>
              <p style={{ color: '#64748b' }}>
                Professional tournament structure with brackets, pool play, and championship rounds
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9ff', borderRadius: '12px' }}>
              <Star size={48} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                Premier Venues
              </h3>
              <p style={{ color: '#64748b' }}>
                Play at college facilities and top recreation centers across Minnesota
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9ff', borderRadius: '12px' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                Competitive Teams
              </h3>
              <p style={{ color: '#64748b' }}>
                Face off against the best teams from across the region
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Circuits */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            textAlign: 'center', 
            marginBottom: '3rem',
            color: '#1e293b'
          }}>
            Our Tournament Circuits
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                style={{ 
                  borderTop: `4px solid ${tournament.color}`,
                  background: 'white',
                  transition: 'all 0.3s'
                }}
                data-testid={`tournament-card-${tournament.id}`}
              >
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <CardTitle style={{ fontSize: '2rem', color: tournament.color }} data-testid={`tournament-name-${tournament.id}`}>
                        {tournament.name}
                      </CardTitle>
                      <CardDescription style={{ fontSize: '1.1rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                        {tournament.tagline}
                      </CardDescription>
                    </div>
                    <Trophy size={40} style={{ color: tournament.color }} />
                  </div>
                </CardHeader>

                <CardContent>
                  <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {tournament.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Calendar size={18} />
                      <span><strong style={{ color: '#1e293b' }}>Season:</strong> {tournament.season}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <MapPin size={18} />
                      <span><strong style={{ color: '#1e293b' }}>Venues:</strong> {tournament.venues}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Users size={18} />
                      <span><strong style={{ color: '#1e293b' }}>Divisions:</strong> {tournament.divisions.join(', ')}</span>
                    </div>
                  </div>

                  <div style={{ 
                    background: `${tournament.color}10`, 
                    padding: '1rem', 
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>Entry Fee per Tournament:</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: '700', color: tournament.color }}>
                        ${tournament.feePerTournament}
                      </span>
                    </div>
                  </div>

                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Tournament Highlights:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {tournament.highlights.map((highlight, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <Star size={16} style={{ marginTop: '2px', color: tournament.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link to={tournament.link} style={{ width: '100%' }}>
                    <Button 
                      className="w-full" 
                      style={{ background: tournament.color, fontSize: '1.1rem', padding: '1.25rem' }}
                      data-testid={`view-circuit-btn-${tournament.id}`}
                    >
                      View Circuit Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Ready to Compete?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Register your team for upcoming Shoot N HOOPS tournaments and experience competitive basketball at its finest.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events/media-gallery">
              <Button style={{ 
                background: 'white', 
                color: '#1e293b',
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}>
                View Media Gallery
              </Button>
            </Link>
            <Button style={{ 
              background: 'transparent', 
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              fontSize: '1.1rem'
            }}>
              Contact Tournament Director
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShootNHoops;
