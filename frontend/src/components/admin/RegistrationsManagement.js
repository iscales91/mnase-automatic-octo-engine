import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function RegistrationsManagement() {
  const [youthRegistrations, setYouthRegistrations] = useState([]);
  const [adultRegistrations, setAdultRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [youthRes, adultRes] = await Promise.all([
        axios.get(`${API}/admin/enhanced-registrations`, { headers }),
        axios.get(`${API}/admin/adult-registrations`, { headers })
      ]);
      setYouthRegistrations(youthRes.data);
      setAdultRegistrations(adultRes.data);
    } catch (error) {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const updateYouthStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/enhanced-registrations/${id}/status?status=${status}`, {}, { headers });
      toast.success(`Registration ${status}`);
      fetchRegistrations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateAdultStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/adult-registrations/${id}/status?status=${status}`, {}, { headers });
      toast.success(`Registration ${status}`);
      fetchRegistrations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const viewDetails = (reg, type) => {
    setSelectedRegistration({ ...reg, type });
    setShowDetailsDialog(true);
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle size={18} style={{ color: '#10b981' }} />;
    if (status === 'pending') return <AlertCircle size={18} style={{ color: '#eab308' }} />;
    return <XCircle size={18} style={{ color: '#ef4444' }} />;
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return { background: '#dcfce7', color: '#166534' };
    if (status === 'pending') return { background: '#fef3c7', color: '#854d0e' };
    return { background: '#fee2e2', color: '#991b1b' };
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '2rem' }}>
        Registrations Management
      </h2>

      <Tabs defaultValue="youth" className="w-full">
        <TabsList style={{ marginBottom: '2rem' }}>
          <TabsTrigger value="youth">
            Youth Registrations ({youthRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="adult">
            Adult Registrations ({adultRegistrations.length})
          </TabsTrigger>
        </TabsList>

        {/* Youth Registrations */}
        <TabsContent value="youth">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {youthRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No youth registrations yet
              </div>
            ) : (
              youthRegistrations
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                          {reg.athlete_first_name} {reg.athlete_last_name}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                          <div><strong>DOB:</strong> {reg.athlete_date_of_birth}</div>
                          <div><strong>Grade:</strong> {reg.athlete_grade}</div>
                          <div><strong>School:</strong> {reg.athlete_school}</div>
                          <div><strong>Skill Level:</strong> {reg.skill_level}</div>
                        </div>
                        <div style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                          <strong>Parent:</strong> {reg.parent_first_name} {reg.parent_last_name} • {reg.parent_email} • {reg.parent_phone}
                        </div>
                        <div style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                          Registered: {new Date(reg.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          ...getStatusColor(reg.status)
                        }}>
                          {getStatusIcon(reg.status)}
                          <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{reg.status}</span>
                        </div>
                        <Select value={reg.status} onValueChange={(value) => updateYouthStatus(reg.id, value)}>
                          <SelectTrigger style={{ width: '150px' }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => viewDetails(reg, 'youth')}>
                          <Eye size={16} style={{ marginRight: '0.5rem' }} />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </TabsContent>

        {/* Adult Registrations */}
        <TabsContent value="adult">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {adultRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No adult registrations yet
              </div>
            ) : (
              adultRegistrations
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                          {reg.participant_name}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                          <div><strong>Email:</strong> {reg.participant_email}</div>
                          <div><strong>Phone:</strong> {reg.participant_phone}</div>
                          <div><strong>Skill Level:</strong> {reg.skill_level}</div>
                          <div><strong>Position:</strong> {reg.position || 'Not specified'}</div>
                        </div>
                        <div style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                          <strong>Emergency Contact:</strong> {reg.emergency_contact_name} ({reg.emergency_contact_relationship}) • {reg.emergency_contact_phone}
                        </div>
                        <div style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                          Registered: {new Date(reg.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          ...getStatusColor(reg.status)
                        }}>
                          {getStatusIcon(reg.status)}
                          <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{reg.status}</span>
                        </div>
                        <Select value={reg.status} onValueChange={(value) => updateAdultStatus(reg.id, value)}>
                          <SelectTrigger style={{ width: '150px' }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => viewDetails(reg, 'adult')}>
                          <Eye size={16} style={{ marginRight: '0.5rem' }} />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedRegistration.type === 'youth' ? (
                <>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Athlete Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div><strong>Name:</strong> {selectedRegistration.athlete_first_name} {selectedRegistration.athlete_last_name}</div>
                      <div><strong>DOB:</strong> {selectedRegistration.athlete_date_of_birth}</div>
                      <div><strong>Gender:</strong> {selectedRegistration.athlete_gender}</div>
                      <div><strong>Grade:</strong> {selectedRegistration.athlete_grade}</div>
                      <div><strong>School:</strong> {selectedRegistration.athlete_school}</div>
                      <div><strong>Email:</strong> {selectedRegistration.athlete_email || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Parent/Guardian</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div><strong>Name:</strong> {selectedRegistration.parent_first_name} {selectedRegistration.parent_last_name}</div>
                      <div><strong>Email:</strong> {selectedRegistration.parent_email}</div>
                      <div><strong>Phone:</strong> {selectedRegistration.parent_phone}</div>
                      <div><strong>Address:</strong> {selectedRegistration.parent_address}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Medical Information</h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div><strong>Conditions:</strong> {selectedRegistration.medical_conditions || 'None'}</div>
                      <div><strong>Allergies:</strong> {selectedRegistration.allergies || 'None'}</div>
                      <div><strong>Insurance:</strong> {selectedRegistration.insurance_provider} - {selectedRegistration.insurance_policy_number}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Basketball Experience</h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div><strong>Years Playing:</strong> {selectedRegistration.years_playing}</div>
                      <div><strong>Skill Level:</strong> {selectedRegistration.skill_level}</div>
                      <div><strong>Position:</strong> {selectedRegistration.position || 'Not specified'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Uniform Sizes</h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div><strong>Shirt:</strong> {selectedRegistration.shirt_size}</div>
                      <div><strong>Shorts:</strong> {selectedRegistration.shorts_size}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Participant Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div><strong>Name:</strong> {selectedRegistration.participant_name}</div>
                      <div><strong>Email:</strong> {selectedRegistration.participant_email}</div>
                      <div><strong>Phone:</strong> {selectedRegistration.participant_phone}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Emergency Contact</h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div><strong>Name:</strong> {selectedRegistration.emergency_contact_name}</div>
                      <div><strong>Relationship:</strong> {selectedRegistration.emergency_contact_relationship}</div>
                      <div><strong>Phone:</strong> {selectedRegistration.emergency_contact_phone}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Basketball Experience</h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div><strong>Skill Level:</strong> {selectedRegistration.skill_level}</div>
                      <div><strong>Years Playing:</strong> {selectedRegistration.years_playing || 'Not specified'}</div>
                      <div><strong>Position:</strong> {selectedRegistration.position || 'Not specified'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Uniform Sizes</h4>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div><strong>Shirt:</strong> {selectedRegistration.shirt_size}</div>
                      <div><strong>Shorts:</strong> {selectedRegistration.shorts_size}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RegistrationsManagement;
