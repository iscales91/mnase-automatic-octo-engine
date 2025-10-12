import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function EnhancedRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const programId = searchParams.get('programId');
  const [currentStep, setCurrentStep] = useState(1);
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    // Athlete Information
    athleteFirstName: '',
    athleteLastName: '',
    athleteDateOfBirth: '',
    athleteGender: '',
    athleteGrade: '',
    athleteSchool: '',
    athleteEmail: '',
    athletePhone: '',
    
    // Parent/Guardian Information
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',
    parentCity: '',
    parentState: '',
    parentZip: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
    // Medical Information
    medicalConditions: '',
    allergies: '',
    medications: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    physicianName: '',
    physicianPhone: '',
    
    // Uniform/Equipment
    shirtSize: '',
    shortsSize: '',
    shoeSize: '',
    
    // Previous Experience
    yearsPlaying: '',
    previousTeams: '',
    position: '',
    skillLevel: '',
    
    // Consents
    mediaConsent: false,
    liabilityWaiver: false,
    codeOfConduct: false,
    medicalTreatment: false,
    
    // Additional
    specialRequests: '',
    howHeardAbout: ''
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.liabilityWaiver || !formData.codeOfConduct || !formData.medicalTreatment) {
      toast.error('Please accept all required consents');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const registrationData = {
        ...formData,
        eventId: eventId || undefined,
        programId: programId || undefined
      };

      await axios.post(`${API}/enhanced-registrations`, registrationData, { headers });
      toast.success('Registration submitted successfully!');
      navigate('/registration-success');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderProgressBar = () => {
    const steps = ['Athlete Info', 'Parent Info', 'Medical Info', 'Uniform', 'Consent'];
    return (
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.75rem',
                background: currentStep > index ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#e8eeff',
                color: currentStep > index ? 'white' : '#64748b',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderRadius: '8px',
                marginRight: index < steps.length - 1 ? '0.5rem' : '0'
              }}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
        <div style={{ height: '8px', background: '#e8eeff', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(currentStep / 5) * 100}%`,
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              transition: 'width 0.3s'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Program Registration
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
            Complete all sections to finalize your registration
          </p>
        </div>

        {renderProgressBar()}

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '2px solid #e8eeff' }}>
            {/* Step 1: Athlete Information */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
                  Athlete Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.athleteFirstName}
                      onChange={(e) => handleInputChange('athleteFirstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.athleteLastName}
                      onChange={(e) => handleInputChange('athleteLastName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={formData.athleteDateOfBirth}
                      onChange={(e) => handleInputChange('athleteDateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select value={formData.athleteGender} onValueChange={(value) => handleInputChange('athleteGender', value)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Grade *</Label>
                    <Input
                      value={formData.athleteGrade}
                      onChange={(e) => handleInputChange('athleteGrade', e.target.value)}
                      placeholder="e.g., 8th Grade"
                      required
                    />
                  </div>
                  <div>
                    <Label>School *</Label>
                    <Input
                      value={formData.athleteSchool}
                      onChange={(e) => handleInputChange('athleteSchool', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Athlete Email</Label>
                    <Input
                      type="email"
                      value={formData.athleteEmail}
                      onChange={(e) => handleInputChange('athleteEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Athlete Phone</Label>
                    <Input
                      type="tel"
                      value={formData.athletePhone}
                      onChange={(e) => handleInputChange('athletePhone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Parent/Guardian Information */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
                  Parent/Guardian Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <Label>Parent First Name *</Label>
                    <Input
                      value={formData.parentFirstName}
                      onChange={(e) => handleInputChange('parentFirstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Parent Last Name *</Label>
                    <Input
                      value={formData.parentLastName}
                      onChange={(e) => handleInputChange('parentLastName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Address *</Label>
                    <Input
                      value={formData.parentAddress}
                      onChange={(e) => handleInputChange('parentAddress', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.parentCity}
                      onChange={(e) => handleInputChange('parentCity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={formData.parentState}
                      onChange={(e) => handleInputChange('parentState', e.target.value)}
                      placeholder="MN"
                      required
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
                      Emergency Contact
                    </h3>
                  </div>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.emergencyName}
                      onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Relationship *</Label>
                    <Input
                      value={formData.emergencyRelationship}
                      onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
                      placeholder="e.g., Uncle, Aunt"
                      required
                    />
                  </div>
                  <div>
                    <Label>Emergency Phone *</Label>
                    <Input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Medical Information */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
                  Medical Information
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <Label>Medical Conditions</Label>
                    <Textarea
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      placeholder="List any medical conditions (e.g., asthma, diabetes)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Allergies</Label>
                    <Textarea
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="List any allergies (food, medication, environmental)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Current Medications</Label>
                    <Textarea
                      value={formData.medications}
                      onChange={(e) => handleInputChange('medications', e.target.value)}
                      placeholder="List any current medications and dosages"
                      rows={3}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <Label>Insurance Provider *</Label>
                      <Input
                        value={formData.insuranceProvider}
                        onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Policy Number *</Label>
                      <Input
                        value={formData.insurancePolicyNumber}
                        onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Physician Name</Label>
                      <Input
                        value={formData.physicianName}
                        onChange={(e) => handleInputChange('physicianName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Physician Phone</Label>
                      <Input
                        type="tel"
                        value={formData.physicianPhone}
                        onChange={(e) => handleInputChange('physicianPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Uniform & Experience */}
            {currentStep === 4 && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
                  Uniform & Experience
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                      Uniform Sizes
                    </h3>
                  </div>
                  <div>
                    <Label>Shirt Size *</Label>
                    <Select value={formData.shirtSize} onValueChange={(value) => handleInputChange('shirtSize', value)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YS">Youth S</SelectItem>
                        <SelectItem value="YM">Youth M</SelectItem>
                        <SelectItem value="YL">Youth L</SelectItem>
                        <SelectItem value="AS">Adult S</SelectItem>
                        <SelectItem value="AM">Adult M</SelectItem>
                        <SelectItem value="AL">Adult L</SelectItem>
                        <SelectItem value="AXL">Adult XL</SelectItem>
                        <SelectItem value="A2XL">Adult 2XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Shorts Size *</Label>
                    <Select value={formData.shortsSize} onValueChange={(value) => handleInputChange('shortsSize', value)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YS">Youth S</SelectItem>
                        <SelectItem value="YM">Youth M</SelectItem>
                        <SelectItem value="YL">Youth L</SelectItem>
                        <SelectItem value="AS">Adult S</SelectItem>
                        <SelectItem value="AM">Adult M</SelectItem>
                        <SelectItem value="AL">Adult L</SelectItem>
                        <SelectItem value="AXL">Adult XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
                      Basketball Experience
                    </h3>
                  </div>
                  <div>
                    <Label>Years Playing *</Label>
                    <Input
                      value={formData.yearsPlaying}
                      onChange={(e) => handleInputChange('yearsPlaying', e.target.value)}
                      placeholder="e.g., 3"
                      required
                    />
                  </div>
                  <div>
                    <Label>Skill Level *</Label>
                    <Select value={formData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
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
                    <Label>Preferred Position</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="e.g., Point Guard, Forward"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Previous Teams/Organizations</Label>
                    <Textarea
                      value={formData.previousTeams}
                      onChange={(e) => handleInputChange('previousTeams', e.target.value)}
                      placeholder="List any previous teams or organizations"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Consents & Agreements */}
            {currentStep === 5 && (
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
                  Consents & Agreements
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: '#f8f9ff', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <Checkbox
                        checked={formData.liabilityWaiver}
                        onCheckedChange={(checked) => handleInputChange('liabilityWaiver', checked)}
                        required
                      />
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Liability Waiver *</div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                          I acknowledge that basketball involves inherent risks. I release MNASE Basketball League from liability for injuries or damages during participation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', background: '#f8f9ff', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <Checkbox
                        checked={formData.medicalTreatment}
                        onCheckedChange={(checked) => handleInputChange('medicalTreatment', checked)}
                        required
                      />
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Medical Treatment Authorization *</div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                          I authorize MNASE staff to secure necessary medical treatment in case of injury or emergency. I am responsible for all medical expenses.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', background: '#f8f9ff', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <Checkbox
                        checked={formData.codeOfConduct}
                        onCheckedChange={(checked) => handleInputChange('codeOfConduct', checked)}
                        required
                      />
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Code of Conduct Agreement *</div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                          I agree to abide by MNASE's Code of Conduct, including respecting coaches, officials, opponents, and demonstrating good sportsmanship.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', background: '#f8f9ff', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <Checkbox
                        checked={formData.mediaConsent}
                        onCheckedChange={(checked) => handleInputChange('mediaConsent', checked)}
                      />
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Photo/Video Release (Optional)</div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                          I grant MNASE permission to use photographs and videos for promotional purposes, website, and social media.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>How did you hear about us?</Label>
                    <Input
                      value={formData.howHeardAbout}
                      onChange={(e) => handleInputChange('howHeardAbout', e.target.value)}
                      placeholder="e.g., Friend, Social Media, School"
                    />
                  </div>

                  <div>
                    <Label>Special Requests or Comments</Label>
                    <Textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Any special accommodations, preferences, or questions?"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e8eeff' }}>
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : <div />}
              
              {currentStep < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', border: 'none' }}>
                  Submit Registration
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnhancedRegistration;
