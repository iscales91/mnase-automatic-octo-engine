import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Recruitment() {
  const pathwaySteps = [
    {
      grade: '6th-8th Grade',
      focus: 'Foundation Building',
      details: [
        'Develop fundamental skills and basketball IQ',
        'Participate in competitive leagues and tournaments',
        'Begin strength and conditioning program',
        'Learn proper nutrition and recovery habits',
        'Attend skill development clinics'
      ]
    },
    {
      grade: '9th-10th Grade',
      focus: 'Skill Refinement',
      details: [
        'Refine position-specific skills',
        'Create highlight video (freshman/sophomore year)',
        'Attend college showcases and camps',
        'Maintain strong academic performance (GPA 3.0+)',
        'Begin NCAA Eligibility Center registration'
      ]
    },
    {
      grade: '11th Grade',
      focus: 'Recruitment Activation',
      details: [
        'Complete updated highlight reel',
        'Take SAT/ACT (aim for college requirements)',
        'Research colleges and basketball programs',
        'Contact college coaches via email/phone',
        'Attend multiple college camps and showcases',
        'Create recruiting profile on NCSA/similar platforms'
      ]
    },
    {
      grade: '12th Grade',
      focus: 'Commitment & Transition',
      details: [
        'Official and unofficial campus visits',
        'Finalize NCAA Eligibility Center requirements',
        'Sign National Letter of Intent (if D1/D2)',
        'Complete college applications',
        'Prepare physically and mentally for college level'
      ]
    }
  ];

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
            <Link to="/recruitment" className="navbar-link">Recruitment</Link>
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
            College Basketball Recruitment
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
            Your pathway to playing college basketball starts here
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '3rem 2rem', background: '#dc2626', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '700' }}>25+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>College Athletes Placed</div>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '700' }}>$2M+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Scholarships Earned</div>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '700' }}>50+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>College Coaches Connected</div>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: '700' }}>100%</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Dedicated Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pathway Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Your College Basketball Pathway
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {pathwaySteps.map((step, index) => (
              <div 
                key={index}
                data-testid={`pathway-step-${index}`}
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  gap: '2rem',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #e8eeff',
                  borderLeft: '6px solid #dc2626'
                }}
              >
                <div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#dc2626',
                    marginBottom: '0.5rem'
                  }}>{index + 1}</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                    {step.grade}
                  </h3>
                  <div style={{ color: '#64748b', fontWeight: '600' }}>{step.focus}</div>
                </div>
                <div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {step.details.map((detail, idx) => (
                      <li key={idx} style={{ 
                        fontSize: '1.1rem', 
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                      }}>
                        <span style={{ color: '#dc2626', fontWeight: '700' }}>✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            MNASE Recruitment Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎥</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Highlight Reel Creation</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Professional video editing and production of highlight reels showcasing your best plays and skills.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Coach Outreach</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Personalized email templates and guidance on contacting college coaches effectively.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏫</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>College Matching</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Identify colleges that match your academic profile, playing style, and personal preferences.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>NCAA Eligibility Support</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Navigate the NCAA Eligibility Center process and ensure you meet all requirements.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Showcase Opportunities</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Connections to elite showcases, camps, and tournaments attended by college scouts.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Mentorship</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                One-on-one guidance from former college athletes and recruitment specialists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Success Stories
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderRadius: '16px', border: '2px solid #fee2e2' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏀</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Marcus J.</h3>
              <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '1rem' }}>University of Minnesota - D1</p>
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                "MNASE helped me navigate the recruiting process. The highlight reel they created got me noticed by multiple D1 programs."
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderRadius: '16px', border: '2px solid #fee2e2' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏀</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Sarah K.</h3>
              <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '1rem' }}>St. Cloud State - D2</p>
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                "The mentorship and college matching services were invaluable. I found the perfect fit academically and athletically."
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderRadius: '16px', border: '2px solid #fee2e2' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏀</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Tyler R.</h3>
              <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '1rem' }}>Macalester College - D3</p>
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                "MNASE connected me with the right coaches and helped me secure a spot on a great team at an excellent academic school."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>
            Ready to Play at the Next Level?
          </h2>
          <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            Schedule a free consultation to discuss your college basketball goals
          </p>
          <Link to="/contact">
            <Button style={{ 
              padding: '1rem 2.5rem', 
              fontSize: '1.2rem',
              background: 'white',
              color: '#dc2626',
              border: 'none',
              fontWeight: '600'
            }}>
              Schedule Consultation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Recruitment;