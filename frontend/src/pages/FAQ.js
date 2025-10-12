import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is MNASE Basketball League?',
          a: 'MNASE (Mentorship, Networking, Athletics, Support, Experience) Basketball League is a comprehensive youth basketball organization offering programs, leagues, tournaments, and training for athletes of all ages and skill levels in Minnesota.'
        },
        {
          q: 'What age groups do you serve?',
          a: 'We serve athletes from ages 8-18, with programs tailored to different age groups and skill levels. Our divisions are typically organized by age/grade, ensuring competitive and age-appropriate play.'
        },
        {
          q: 'Where are your facilities located?',
          a: 'We operate throughout the Minneapolis-St. Paul metro area and utilize various college and high school facilities across Minnesota. Specific locations vary by program and event.'
        }
      ]
    },
    {
      category: 'Registration',
      questions: [
        {
          q: 'How do I register for a program?',
          a: 'Registration is available online through our website. Navigate to the specific program page, click the registration button, and follow the prompts. You\'ll need to create an account, complete the registration form, and submit payment.'
        },
        {
          q: 'What is your refund policy?',
          a: 'Full refunds are available up to 14 days before a program starts. Between 7-14 days before start, a 50% refund is provided. Within 7 days of the program start, no refunds are given. See our Policies page for complete details.'
        },
        {
          q: 'Can I register after the deadline?',
          a: 'Late registration may be available on a case-by-case basis depending on program capacity. Contact us directly to inquire about late registration options. A late fee may apply.'
        },
        {
          q: 'Do you offer payment plans?',
          a: 'Yes! We offer flexible payment plans for most programs. During registration, you can choose to pay in full or select a payment plan option with multiple installments.'
        }
      ]
    },
    {
      category: 'Programs',
      questions: [
        {
          q: 'What\'s the difference between your league programs?',
          a: 'Elite Mammoths is our premier travel program (March-June) with tournament play. Second Chance Shots (Nov-March) focuses on development. Lockdown 3on3 (July-Sept) is a fast-paced summer league. Weekend Draft is a year-round weekly pick-up style league.'
        },
        {
          q: 'What should my child bring to practices and games?',
          a: 'Players should bring: basketball shoes (non-marking soles), water bottle, basketball (for practices), appropriate athletic wear, and any required medical items. Team uniforms are provided for league participants.'
        },
        {
          q: 'How are teams formed?',
          a: 'Teams are formed based on age/grade, skill level, and tryout performance (for competitive programs). We aim to create balanced, competitive teams that foster growth and enjoyment.'
        }
      ]
    },
    {
      category: 'Memberships',
      questions: [
        {
          q: 'Do I need a membership to participate?',
          a: 'Memberships are optional but recommended. They provide discounts on programs, priority registration, and access to members-only events. You can participate in programs without a membership at standard rates.'
        },
        {
          q: 'What\'s included in a family membership?',
          a: 'Family memberships cover up to 4 family members living in the same household. Benefits include 15% discount on all programs, priority registration, access to open gym sessions, and exclusive member events.'
        }
      ]
    },
    {
      category: 'Mentality Academy',
      questions: [
        {
          q: 'What\'s the difference between camps, clinics, and workshops?',
          a: 'Camps are multi-day intensive training programs (3-5 days). Clinics are shorter 2-hour focused sessions on specific skills. Workshops are educational sessions covering topics like mental toughness, film study, or college recruitment.'
        },
        {
          q: 'Can I attend individual clinics without joining a program?',
          a: 'Absolutely! All our Mentality Academy offerings (camps, clinics, workshops) are open to everyone, regardless of league participation. They\'re great standalone opportunities for skill development.'
        }
      ]
    },
    {
      category: 'Tournaments & Events',
      questions: [
        {
          q: 'How do I register my team for a tournament?',
          a: 'Team registration for Shoot N HOOPS tournaments (Summer Sizzle and Winter Wars circuits) is available through the Events section of our website. A coach or team manager must complete the registration and roster.'
        },
        {
          q: 'What format do tournaments use?',
          a: 'We use pool play followed by single-elimination brackets. All teams are guaranteed a minimum number of games. Specific formats vary by division and tournament size.'
        }
      ]
    },
    {
      category: 'Facilities',
      questions: [
        {
          q: 'Can I rent a court for private use?',
          a: 'Yes! Court rentals are available by the hour for team practices, private training, or group events. Visit our Facilities page to see available locations, rates, and booking options.'
        },
        {
          q: 'Do you offer open gym times?',
          a: 'We offer open gym sessions throughout the week at various locations. Members receive complimentary access while non-members can purchase day passes. Check our schedule for current times.'
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

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
        padding: '5rem 2rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>
            Find answers to common questions about MNASE Basketball League
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {faqs.map((category, catIndex) => (
            <div key={catIndex} style={{ marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                marginBottom: '2rem', 
                color: '#dc2626',
                borderBottom: '3px solid #dc2626',
                paddingBottom: '0.5rem'
              }}>
                {category.category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {category.questions.map((faq, qIndex) => {
                  const isOpen = openIndex === `${catIndex}-${qIndex}`;
                  return (
                    <div 
                      key={qIndex}
                      style={{ 
                        border: '2px solid #e8eeff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.3s'
                      }}
                    >
                      <button
                        onClick={() => toggleFAQ(catIndex, qIndex)}
                        data-testid={`faq-question-${catIndex}-${qIndex}`}
                        style={{
                          width: '100%',
                          padding: '1.5rem',
                          background: isOpen ? 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' : 'white',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '1.3rem',
                          fontWeight: '600',
                          color: '#1e293b',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s'
                        }}
                      >
                        <span>{faq.q}</span>
                        <span style={{ fontSize: '1.5rem', color: '#dc2626' }}>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div 
                          data-testid={`faq-answer-${catIndex}-${qIndex}`}
                          style={{ 
                            padding: '1.5rem', 
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                            borderTop: '1px solid #e8eeff'
                          }}
                        >
                          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
            Still Have Questions?
          </h2>
          <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            We're here to help! Reach out to our team for personalized assistance.
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
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default FAQ;