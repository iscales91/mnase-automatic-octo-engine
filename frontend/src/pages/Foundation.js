import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Foundation() {
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
            <Link to="/foundation" className="navbar-link">Foundation</Link>
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
            MNASE Foundation
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
            Empowering youth through basketball, education, and community support
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
              Our Mission
            </h2>
            <p style={{ fontSize: '1.3rem', color: '#64748b', lineHeight: '1.8', maxWidth: '900px', margin: '0 auto' }}>
              The MNASE Foundation provides financial assistance, mentorship, and resources to underserved youth, ensuring that every child has the opportunity to participate in basketball and develop life skills regardless of their family's economic circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700' }}>150+</div>
              <div style={{ fontSize: '1.3rem', opacity: 0.9 }}>Youth Served Annually</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700' }}>$75K</div>
              <div style={{ fontSize: '1.3rem', opacity: 0.9 }}>Scholarships Awarded</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700' }}>500+</div>
              <div style={{ fontSize: '1.3rem', opacity: 0.9 }}>Equipment Donations</div>
            </div>
            <div>
              <div style={{ fontSize: '4rem', fontWeight: '700' }}>25+</div>
              <div style={{ fontSize: '1.3rem', opacity: 0.9 }}>Mentors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Foundation Programs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Scholarship Program</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Full and partial scholarships covering registration fees, uniforms, equipment, and travel expenses for qualifying families.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Mentorship Initiative</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                One-on-one mentorship pairing youth with positive role models including former college athletes and community leaders.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Academic Support</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Tutoring services, study groups, and educational resources ensuring student-athletes maintain strong academic performance.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎽</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Equipment Bank</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Free basketball shoes, apparel, and equipment for athletes in need, ensuring everyone has proper gear to play safely.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Summer Access</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Free summer camps and clinics providing structured activities and skill development during school breaks.
              </p>
            </div>
            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Family Support</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Resources and assistance for families including transportation support, meal programs, and community connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Help Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            How You Can Help
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💵</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Make a Donation</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Tax-deductible donations directly support scholarships, equipment, and program operations.
              </p>
              <Link to="/contact">
                <Button style={{ 
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  border: 'none',
                  padding: '0.75rem 1.5rem'
                }}>
                  Donate Now
                </Button>
              </Link>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎽</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Donate Equipment</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Gently used basketball shoes, apparel, and equipment help outfit athletes in need.
              </p>
              <Link to="/contact">
                <Button style={{ 
                  background: 'transparent',
                  border: '2px solid #dc2626',
                  color: '#dc2626',
                  padding: '0.75rem 1.5rem'
                }}>
                  Learn More
                </Button>
              </Link>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Become a Mentor</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Share your experience and provide guidance as a mentor to a young athlete.
              </p>
              <Link to="/get-involved">
                <Button style={{ 
                  background: 'transparent',
                  border: '2px solid #dc2626',
                  color: '#dc2626',
                  padding: '0.75rem 1.5rem'
                }}>
                  Apply to Mentor
                </Button>
              </Link>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏭</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Corporate Partnership</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Partner with us through sponsorships, matching gifts, or employee volunteer programs.
              </p>
              <Link to="/sponsorship">
                <Button style={{ 
                  background: 'transparent',
                  border: '2px solid #dc2626',
                  color: '#dc2626',
                  padding: '0.75rem 1.5rem'
                }}>
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Information */}
      <section style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Tax-Deductible Giving
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.8' }}>
            The MNASE Foundation is a 501(c)(3) nonprofit organization. All donations are tax-deductible to the fullest extent allowed by law. EIN: XX-XXXXXXX
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>
            Every Child Deserves to Play
          </h2>
          <p style={{ fontSize: '1.3rem', color: '#94a3b8', marginBottom: '2rem' }}>
            Your support changes lives. Help us provide opportunities for youth to develop skills, build character, and pursue their dreams.
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
              Support the Foundation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Foundation;