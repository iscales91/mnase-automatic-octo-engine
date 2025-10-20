import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [divisions, setDivisions] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      const activePrograms = response.data.filter(p => p.active);
      setPrograms(activePrograms);
      
      // Fetch divisions for each program
      for (const program of activePrograms) {
        fetchDivisions(program.id);
      }
    } catch (error) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async (programId) => {
    try {
      const response = await axios.get(`${API}/programs/${programId}/divisions`);
      setDivisions(prev => ({
        ...prev,
        [programId]: response.data.filter(d => d.active)
      }));
    } catch (error) {
      // Divisions might not exist for this program
      setDivisions(prev => ({
        ...prev,
        [programId]: []
      }));
    }
  };

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

      <div style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }} data-testid="programs-title">
            MNASE Programs
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }} data-testid="programs-subtitle">
            Year-round basketball development through leagues, travel, and training programs
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading programs...</div>
          ) : programs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-programs-message">
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No programs available at the moment.</p>
            </div>
          ) : (
            <div className="card-grid">
              {programs.map((program) => (
                <Card key={program.id} data-testid={`program-card-${program.id}`} style={{ borderTop: '4px solid #dc2626' }}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <CardTitle data-testid={`program-name-${program.id}`}>{program.name}</CardTitle>
                      <span className="card-badge" style={{ background: '#fee2e2', color: '#991b1b' }} data-testid={`program-season-${program.id}`}>{program.season}</span>
                    </div>
                    <CardDescription data-testid={`program-description-${program.id}`}>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: '#475569', marginBottom: '1rem', lineHeight: '1.6' }} data-testid={`program-long-desc-${program.id}`}>
                      {program.long_description}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <Users size={18} />
                        <span data-testid={`program-age-${program.id}`}>{program.age_range}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <Calendar size={18} />
                        <span data-testid={`program-schedule-${program.id}`}>{program.schedule}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: '600', fontSize: '1.1rem' }}>
                        <DollarSign size={18} />
                        <span data-testid={`program-price-${program.id}`}>${program.price}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1e293b' }}>Includes:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {program.inclusions.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                            <CheckCircle size={16} style={{ marginTop: '2px', color: '#16a34a', flexShrink: 0 }} />
                            <span data-testid={`program-inclusion-${program.id}-${idx}`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #dc2626' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.9rem' }}>Registration Info:</strong>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }} data-testid={`program-reg-info-${program.id}`}>{program.registration_info}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/programs/${program.slug}`} style={{ width: '100%' }}>
                      <Button className="w-full" style={{ background: '#dc2626' }} data-testid={`view-program-btn-${program.id}`}>
                        Learn More & Register
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Programs;