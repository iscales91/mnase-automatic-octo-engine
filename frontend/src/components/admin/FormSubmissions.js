import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function FormSubmissions() {
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [sponsorshipInquiries, setSponsorshipInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [contactRes, volunteerRes, sponsorRes] = await Promise.all([
        axios.get(`${API}/admin/contact-submissions`, { headers }),
        axios.get(`${API}/admin/volunteer-applications`, { headers }),
        axios.get(`${API}/admin/sponsorship-inquiries`, { headers })
      ]);
      
      setContactSubmissions(contactRes.data);
      setVolunteerApplications(volunteerRes.data);
      setSponsorshipInquiries(sponsorRes.data);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/contact-submissions/${id}/status?status=${status}`, {}, { headers });
      toast.success('Status updated');
      fetchAllSubmissions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateVolunteerStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/volunteer-applications/${id}/status?status=${status}`, {}, { headers });
      toast.success('Status updated');
      fetchAllSubmissions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateSponsorshipStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/sponsorship-inquiries/${id}/status?status=${status}`, {}, { headers });
      toast.success('Status updated');
      fetchAllSubmissions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '2rem' }}>Form Submissions</h2>
      
      <Tabs defaultValue="contact" className="w-full">
        <TabsList style={{ marginBottom: '2rem' }}>
          <TabsTrigger value="contact" data-testid="contact-tab">
            Contact Forms ({contactSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="volunteer" data-testid="volunteer-tab">
            Volunteer Apps ({volunteerApplications.length})
          </TabsTrigger>
          <TabsTrigger value="sponsorship" data-testid="sponsorship-tab">
            Sponsorship ({sponsorshipInquiries.length})
          </TabsTrigger>
        </TabsList>

        {/* Contact Submissions */}
        <TabsContent value="contact" data-testid="contact-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contactSubmissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No contact submissions yet
              </div>
            ) : (
              contactSubmissions
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((submission) => (
                  <div
                    key={submission.id}
                    data-testid={`contact-submission-${submission.id}`}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{submission.subject}</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          From: {submission.name} ({submission.email})
                          {submission.phone && ` • ${submission.phone}`}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {new Date(submission.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Select value={submission.status} onValueChange={(value) => updateContactStatus(submission.id, value)}>
                        <SelectTrigger style={{ width: '150px' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p style={{ color: '#475569', lineHeight: '1.6' }}>{submission.message}</p>
                  </div>
                ))
            )}
          </div>
        </TabsContent>

        {/* Volunteer Applications */}
        <TabsContent value="volunteer" data-testid="volunteer-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {volunteerApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No volunteer applications yet
              </div>
            ) : (
              volunteerApplications
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((app) => (
                  <div
                    key={app.id}
                    data-testid={`volunteer-app-${app.id}`}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{app.name}</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          {app.email} • {app.phone}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {new Date(app.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Select value={app.status} onValueChange={(value) => updateVolunteerStatus(app.id, value)}>
                        <SelectTrigger style={{ width: '150px' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Interest</div>
                        <div style={{ color: '#1e293b' }}>{app.interest}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Availability</div>
                        <div style={{ color: '#1e293b' }}>{app.availability}</div>
                      </div>
                    </div>
                    {app.experience && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Experience</div>
                        <p style={{ color: '#475569' }}>{app.experience}</p>
                      </div>
                    )}
                    {app.message && (
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Message</div>
                        <p style={{ color: '#475569' }}>{app.message}</p>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </TabsContent>

        {/* Sponsorship Inquiries */}
        <TabsContent value="sponsorship" data-testid="sponsorship-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sponsorshipInquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No sponsorship inquiries yet
              </div>
            ) : (
              sponsorshipInquiries
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((inquiry) => (
                  <div
                    key={inquiry.id}
                    data-testid={`sponsorship-inquiry-${inquiry.id}`}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{inquiry.company}</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          Contact: {inquiry.contact}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          {inquiry.email} • {inquiry.phone}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Select value={inquiry.status} onValueChange={(value) => updateSponsorshipStatus(inquiry.id, value)}>
                        <SelectTrigger style={{ width: '150px' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="in_discussion">In Discussion</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Sponsorship Interest</div>
                      <div style={{ color: '#1e293b' }}>{inquiry.interest}</div>
                    </div>
                    {inquiry.message && (
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Message</div>
                        <p style={{ color: '#475569' }}>{inquiry.message}</p>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FormSubmissions;