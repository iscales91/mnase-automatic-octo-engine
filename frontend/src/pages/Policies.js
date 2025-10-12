import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Policies() {
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
            <Link to="/policies" className="navbar-link">Policies</Link>
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
            Policies & Guidelines
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>
            Important information about participation, safety, and conduct
          </p>
        </div>
      </section>

      {/* Policies Tabs */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Tabs defaultValue="refund" className="w-full">
            <TabsList style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center', 
              background: '#f8f9ff',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '3rem',
              gap: '0.5rem'
            }}>
              <TabsTrigger value="refund" data-testid="refund-tab" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Refund Policy</TabsTrigger>
              <TabsTrigger value="conduct" data-testid="conduct-tab" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Code of Conduct</TabsTrigger>
              <TabsTrigger value="waiver" data-testid="waiver-tab" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Waiver</TabsTrigger>
              <TabsTrigger value="media" data-testid="media-tab" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Media Release</TabsTrigger>
              <TabsTrigger value="privacy" data-testid="privacy-tab" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Privacy Policy</TabsTrigger>
            </TabsList>

            {/* Refund Policy */}
            <TabsContent value="refund" data-testid="refund-content">
              <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: '#dc2626' }}>Refund Policy</h2>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Program Cancellations by Participants</h3>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>14+ days before start:</strong> Full refund minus $25 processing fee</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>7-14 days before start:</strong> 50% refund</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Less than 7 days before start:</strong> No refund</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>After program starts:</strong> No refund under any circumstances</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Program Cancellations by MNASE</h3>
                  <p style={{ marginBottom: '1rem' }}>If MNASE must cancel a program due to insufficient enrollment, weather, facility issues, or other circumstances beyond our control, participants will receive:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Full refund of all fees paid, OR</li>
                    <li style={{ marginBottom: '0.5rem' }}>Credit toward another MNASE program of equal or greater value</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Medical Exemptions</h3>
                  <p style={{ marginBottom: '1rem' }}>Refunds may be considered for documented medical reasons preventing participation. A doctor's note must be submitted within 7 days of the medical issue. Medical refunds are subject to a $50 processing fee.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Non-Refundable Items</h3>
                  <p style={{ marginBottom: '1rem' }}>The following are non-refundable under all circumstances:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Membership fees</li>
                    <li style={{ marginBottom: '0.5rem' }}>Uniforms and team gear</li>
                    <li style={{ marginBottom: '0.5rem' }}>Tournament entry fees</li>
                    <li style={{ marginBottom: '0.5rem' }}>One-time event registrations</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Refund Processing</h3>
                  <p>Approved refunds will be processed within 14 business days and returned to the original payment method. For questions about refunds, contact us at info@mnasebasketball.com.</p>
                </div>
              </div>
            </TabsContent>

            {/* Code of Conduct */}
            <TabsContent value="conduct" data-testid="conduct-content">
              <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: '#dc2626' }}>Code of Conduct</h2>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
                  <p style={{ marginBottom: '1.5rem' }}>All participants, parents, coaches, and spectators are expected to uphold the highest standards of sportsmanship and respect.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Player Expectations</h3>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Show respect to coaches, officials, opponents, and teammates</li>
                    <li style={{ marginBottom: '0.5rem' }}>Demonstrate good sportsmanship in victory and defeat</li>
                    <li style={{ marginBottom: '0.5rem' }}>Attend all scheduled practices and games on time</li>
                    <li style={{ marginBottom: '0.5rem' }}>Wear appropriate athletic attire and follow uniform guidelines</li>
                    <li style={{ marginBottom: '0.5rem' }}>Maintain academic eligibility and prioritize education</li>
                    <li style={{ marginBottom: '0.5rem' }}>Refrain from profanity, taunting, or unsportsmanlike conduct</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Parent/Guardian Expectations</h3>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Support your child's development and effort over winning</li>
                    <li style={{ marginBottom: '0.5rem' }}>Respect coaching decisions and communicate concerns appropriately</li>
                    <li style={{ marginBottom: '0.5rem' }}>Refrain from coaching from the sidelines during games</li>
                    <li style={{ marginBottom: '0.5rem' }}>Model positive behavior and respect for all participants</li>
                    <li style={{ marginBottom: '0.5rem' }}>Never confront officials or coaches during or immediately after games</li>
                    <li style={{ marginBottom: '0.5rem' }}>Ensure timely drop-off and pick-up of players</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Coach Expectations</h3>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Prioritize player safety and well-being above all else</li>
                    <li style={{ marginBottom: '0.5rem' }}>Provide equal opportunities for player development</li>
                    <li style={{ marginBottom: '0.5rem' }}>Communicate clearly with players, parents, and officials</li>
                    <li style={{ marginBottom: '0.5rem' }}>Model respectful behavior and positive sportsmanship</li>
                    <li style={{ marginBottom: '0.5rem' }}>Address conflicts privately and professionally</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Consequences for Violations</h3>
                  <p style={{ marginBottom: '1rem' }}>Violations of this Code of Conduct may result in:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Verbal or written warning</li>
                    <li style={{ marginBottom: '0.5rem' }}>Suspension from games or programs</li>
                    <li style={{ marginBottom: '0.5rem' }}>Removal from facilities</li>
                    <li style={{ marginBottom: '0.5rem' }}>Permanent ban from MNASE programs</li>
                  </ul>
                  <p>All decisions regarding conduct violations are at the discretion of MNASE leadership and are final.</p>
                </div>
              </div>
            </TabsContent>

            {/* Waiver */}
            <TabsContent value="waiver" data-testid="waiver-content">
              <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: '#dc2626' }}>Liability Waiver & Release</h2>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
                  <p style={{ marginBottom: '1.5rem', fontStyle: 'italic' }}>By participating in MNASE Basketball League programs, participants and parents/guardians acknowledge and agree to the following:</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Assumption of Risk</h3>
                  <p style={{ marginBottom: '1rem' }}>I understand that basketball involves physical activity and carries inherent risks including, but not limited to, sprains, strains, fractures, concussions, and other injuries. I voluntarily assume all risks associated with participation.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Release of Liability</h3>
                  <p style={{ marginBottom: '1rem' }}>I hereby release, waive, and discharge MNASE Basketball League, its directors, officers, coaches, volunteers, and affiliated organizations from any and all liability for injuries, damages, or losses that may occur during participation in programs, practices, games, tournaments, or related activities.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Medical Treatment Authorization</h3>
                  <p style={{ marginBottom: '1rem' }}>In the event of injury or medical emergency, I authorize MNASE staff to secure necessary medical treatment. I understand I am responsible for all medical expenses incurred.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Participant Health</h3>
                  <p style={{ marginBottom: '1rem' }}>I certify that the participant is in good health and physically capable of participating in basketball activities. I will notify MNASE of any medical conditions, allergies, or physical limitations that may affect participation.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Insurance</h3>
                  <p style={{ marginBottom: '1rem' }}>I understand that MNASE does not provide health insurance coverage for participants. I am responsible for maintaining adequate health insurance and will cover all medical expenses.</p>

                  <p style={{ marginTop: '2rem', fontWeight: '600', color: '#dc2626' }}>This waiver is binding and will be in effect for all MNASE programs during the current calendar year.</p>
                </div>
              </div>
            </TabsContent>

            {/* Media Release */}
            <TabsContent value="media" data-testid="media-content">
              <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: '#dc2626' }}>Photo/Video Release Policy</h2>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
                  <p style={{ marginBottom: '1.5rem' }}>MNASE Basketball League values participant privacy while promoting our programs and celebrating achievements.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Media Usage</h3>
                  <p style={{ marginBottom: '1rem' }}>By participating in MNASE programs, you grant permission for MNASE to capture and use photographs, videos, and audio recordings for:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Website and social media content</li>
                    <li style={{ marginBottom: '0.5rem' }}>Promotional materials and advertising</li>
                    <li style={{ marginBottom: '0.5rem' }}>Program highlights and recaps</li>
                    <li style={{ marginBottom: '0.5rem' }}>Fundraising and sponsor presentations</li>
                    <li style={{ marginBottom: '0.5rem' }}>News media and press releases</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Opt-Out Option</h3>
                  <p style={{ marginBottom: '1rem' }}>If you do not wish to have your child's photo or video used, you may opt out by:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Indicating "No Media Consent" during registration</li>
                    <li style={{ marginBottom: '0.5rem' }}>Emailing info@mnasebasketball.com with your opt-out request</li>
                    <li style={{ marginBottom: '0.5rem' }}>Submitting a written opt-out form</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Third-Party Recording</h3>
                  <p style={{ marginBottom: '1rem' }}>Parents and spectators may record games and events for personal use. However, any media posted publicly must respect the privacy of all participants and comply with MNASE's social media guidelines.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Media Removal Requests</h3>
                  <p style={{ marginBottom: '1rem' }}>If you would like specific media removed from MNASE platforms, contact us at info@mnasebasketball.com. We will honor removal requests within 10 business days.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Livestreaming</h3>
                  <p>Select MNASE events may be livestreamed or recorded for later viewing. These recordings may be available on our website, social media, or third-party platforms. Participants who opt out of media consent will not be featured in promotional content, but may appear in general game footage.</p>
                </div>
              </div>
            </TabsContent>

            {/* Privacy Policy */}
            <TabsContent value="privacy" data-testid="privacy-content">
              <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', borderRadius: '16px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: '#dc2626' }}>Privacy Policy</h2>
                <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
                  <p style={{ marginBottom: '1.5rem' }}>Last Updated: January 2025</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Information We Collect</h3>
                  <p style={{ marginBottom: '1rem' }}>We collect information necessary to provide our services, including:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Name, age, date of birth, gender</li>
                    <li style={{ marginBottom: '0.5rem' }}>Contact information (address, phone, email)</li>
                    <li style={{ marginBottom: '0.5rem' }}>Emergency contact details</li>
                    <li style={{ marginBottom: '0.5rem' }}>Medical information relevant to participation</li>
                    <li style={{ marginBottom: '0.5rem' }}>Payment and billing information</li>
                    <li style={{ marginBottom: '0.5rem' }}>Program registration and participation history</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>How We Use Your Information</h3>
                  <p style={{ marginBottom: '1rem' }}>We use collected information to:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Process registrations and payments</li>
                    <li style={{ marginBottom: '0.5rem' }}>Communicate about programs, schedules, and events</li>
                    <li style={{ marginBottom: '0.5rem' }}>Ensure participant safety and provide emergency care</li>
                    <li style={{ marginBottom: '0.5rem' }}>Improve our programs and services</li>
                    <li style={{ marginBottom: '0.5rem' }}>Send newsletters and promotional materials (with consent)</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Information Sharing</h3>
                  <p style={{ marginBottom: '1rem' }}>We do not sell or rent personal information. We may share information with:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Coaches and staff (as needed for program delivery)</li>
                    <li style={{ marginBottom: '0.5rem' }}>Payment processors (for transaction processing)</li>
                    <li style={{ marginBottom: '0.5rem' }}>Emergency medical personnel (in case of emergency)</li>
                    <li style={{ marginBottom: '0.5rem' }}>Law enforcement (when required by law)</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Data Security</h3>
                  <p style={{ marginBottom: '1rem' }}>We implement appropriate security measures to protect your information, including secure servers, encrypted payment processing, and restricted access to personal data.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Your Rights</h3>
                  <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
                  <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>Access your personal information</li>
                    <li style={{ marginBottom: '0.5rem' }}>Request corrections to inaccurate data</li>
                    <li style={{ marginBottom: '0.5rem' }}>Opt out of promotional communications</li>
                    <li style={{ marginBottom: '0.5rem' }}>Request deletion of data (subject to legal requirements)</li>
                  </ul>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Cookies and Tracking</h3>
                  <p style={{ marginBottom: '1rem' }}>Our website uses cookies to improve user experience, analyze site traffic, and provide personalized content. You can control cookie settings through your browser.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Children's Privacy</h3>
                  <p style={{ marginBottom: '1rem' }}>We comply with the Children's Online Privacy Protection Act (COPPA). We collect information from minors only with parental consent and for legitimate program purposes.</p>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Contact Us</h3>
                  <p>For privacy-related questions or to exercise your rights, contact us at privacy@mnasebasketball.com or (612) 555-1234.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

export default Policies;