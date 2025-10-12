import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProgramRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const programId = searchParams.get('programId');
  const [registrationType, setRegistrationType] = useState(null); // 'adult' or 'youth'
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      toast.error('Please login to register');
      navigate('/');
    }
  }, [token, navigate]);

  const handleAdultRegistration = () => {
    setRegistrationType('adult');
  };

  const handleYouthRegistration = () => {
    navigate(`/register?eventId=${eventId || ''}&programId=${programId || ''}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
            Program Registration
          </h1>
          <p style={{ fontSize: '1.3rem', color: '#64748b' }}>
            Choose the type of registration
          </p>
        </div>

        {!registrationType ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Adult Registration Card */}
            <Card 
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid #e8eeff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e8eeff';
              }}
              onClick={handleAdultRegistration}
            >
              <CardHeader>
                <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>🏀</div>
                <CardTitle style={{ fontSize: '2rem', textAlign: 'center' }}>Adult Registration</CardTitle>
                <CardDescription style={{ fontSize: '1.1rem', textAlign: 'center' }}>
                  Register yourself for adult programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#64748b' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Quick registration (2 minutes)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Adult leagues (18+ years)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Open gyms & clinics
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Tournament registration
                  </li>
                </ul>
                <Button 
                  style={{ 
                    width: '100%', 
                    marginTop: '1.5rem',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    border: 'none'
                  }}
                >
                  Register as Adult
                </Button>
              </CardContent>
            </Card>

            {/* Youth Registration Card */}
            <Card 
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid #e8eeff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e8eeff';
              }}
              onClick={handleYouthRegistration}
            >
              <CardHeader>
                <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
                <CardTitle style={{ fontSize: '2rem', textAlign: 'center' }}>Youth Registration</CardTitle>
                <CardDescription style={{ fontSize: '1.1rem', textAlign: 'center' }}>
                  Register a youth athlete (17 and under)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#64748b' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Comprehensive form (5 steps)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Youth leagues (17 and under)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Medical & emergency info
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                    Parent/guardian required
                  </li>
                </ul>
                <Button 
                  style={{ 
                    width: '100%', 
                    marginTop: '1.5rem',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    border: 'none'
                  }}
                >
                  Register Youth Athlete
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AdultRegistrationForm 
            eventId={eventId} 
            programId={programId} 
            user={user}
            onBack={() => setRegistrationType(null)}
          />
        )}
      </div>
    </div>
  );
}

function AdultRegistrationForm({ eventId, programId, user, onBack }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [formData, setFormData] = useState({
    eventId: eventId || '',
    programId: programId || '',
    participantName: user.name || '',
    participantEmail: user.email || '',
    participantPhone: user.phone || '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
    shirtSize: '',
    shortsSize: '',
    skillLevel: '',
    yearsPlaying: '',
    position: '',
    previousExperience: '',
    specialRequests: '',
    liabilityWaiver: false,
    codeOfConduct: false,
    mediaConsent: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.liabilityWaiver || !formData.codeOfConduct) {
      toast.error('Please accept all required agreements');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/adult-registrations`, formData, { headers });
      toast.success('Registration submitted successfully!');
      navigate('/registration-success');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '2px solid #e8eeff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
            Adult Program Registration
          </h2>
          <Button type="button" variant="outline" onClick={onBack}>
            ← Back
          </Button>
        </div>

        {/* Participant Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Participant Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.participantName}
                onChange={(e) => setFormData({...formData, participantName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.participantEmail}
                onChange={(e) => setFormData({...formData, participantEmail: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                type="tel"
                value={formData.participantPhone}
                onChange={(e) => setFormData({...formData, participantPhone: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Emergency Contact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <Label>Emergency Contact Name *</Label>
              <Input
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Emergency Contact Phone *</Label>
              <Input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Relationship *</Label>
              <Input
                value={formData.emergencyContactRelationship}
                onChange={(e) => setFormData({...formData, emergencyContactRelationship: e.target.value})}
                placeholder="e.g., Spouse, Sibling, Friend"
                required
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Medical Information (Optional)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Label>Medical Conditions</Label>
              <Textarea
                value={formData.medicalConditions}
                onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                placeholder="List any medical conditions we should be aware of"
                rows={2}
              />
            </div>
            <div>
              <Label>Allergies</Label>
              <Textarea
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                placeholder="List any allergies"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Basketball Experience */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Basketball Experience
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <Label>Skill Level *</Label>
              <Select value={formData.skillLevel} onValueChange={(value) => setFormData({...formData, skillLevel: value})}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Years Playing</Label>
              <Input
                value={formData.yearsPlaying}
                onChange={(e) => setFormData({...formData, yearsPlaying: e.target.value})}
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <Label>Preferred Position</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="e.g., Guard, Forward, Center"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Previous Experience</Label>
              <Textarea
                value={formData.previousExperience}
                onChange={(e) => setFormData({...formData, previousExperience: e.target.value})}
                placeholder="Brief description of your basketball experience"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Uniform Sizes */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Uniform Sizes *
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <Label>Shirt Size *</Label>
              <Select value={formData.shirtSize} onValueChange={(value) => setFormData({...formData, shirtSize: value})}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Small</SelectItem>
                  <SelectItem value="M">Medium</SelectItem>
                  <SelectItem value="L">Large</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                  <SelectItem value="3XL">3XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shorts Size *</Label>
              <Select value={formData.shortsSize} onValueChange={(value) => setFormData({...formData, shortsSize: value})}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Small</SelectItem>
                  <SelectItem value="M">Medium</SelectItem>
                  <SelectItem value="L">Large</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Agreements */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            Agreements & Consents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#f8f9ff', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
              <Checkbox
                checked={formData.liabilityWaiver}
                onCheckedChange={(checked) => setFormData({...formData, liabilityWaiver: checked})}
                required
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Liability Waiver *</div>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  I acknowledge the risks of basketball participation and release MNASE from liability.
                </p>
              </div>
            </div>
            <div style={{ padding: '1rem', background: '#f8f9ff', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
              <Checkbox
                checked={formData.codeOfConduct}
                onCheckedChange={(checked) => setFormData({...formData, codeOfConduct: checked})}
                required
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Code of Conduct *</div>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  I agree to follow MNASE's Code of Conduct and demonstrate good sportsmanship.
                </p>
              </div>
            </div>
            <div style={{ padding: '1rem', background: '#f8f9ff', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
              <Checkbox
                checked={formData.mediaConsent}
                onCheckedChange={(checked) => setFormData({...formData, mediaConsent: checked})}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Media Consent (Optional)</div>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  I grant permission to use photos/videos for promotional purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div style={{ marginBottom: '2rem' }}>
          <Label>Special Requests or Comments</Label>
          <Textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
            placeholder="Any special accommodations or preferences?"
            rows={3}
          />
        </div>

        <Button 
          type="submit" 
          style={{ 
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            border: 'none'
          }}
        >
          Submit Registration
        </Button>
      </div>
    </form>
  );
}

export default ProgramRegistration;
