import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AffiliateManagement() {
  const [applications, setApplications] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState(0.15);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role === 'super_admin';

  useEffect(() => {
    fetchApplications();
    fetchAffiliates();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/admin/affiliates/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliates = async () => {
    try {
      const response = await axios.get(`${API}/admin/affiliates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAffiliates(response.data.affiliates || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      await axios.post(`${API}/admin/affiliates/approve`, {
        application_id: applicationId,
        admin_id: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Affiliate approved successfully!');
      fetchApplications();
      fetchAffiliates();
      setShowApplicationDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve application');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await axios.post(`${API}/admin/affiliates/reject`, {
        application_id: applicationId,
        admin_id: user.id,
        reason: rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Application rejected');
      fetchApplications();
      setShowApplicationDialog(false);
      setRejectionReason('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject application');
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedAffiliate) return;
    
    try {
      await axios.put(`${API}/admin/affiliates/commission-rate`, {
        affiliate_id: selectedAffiliate._id,
        new_rate: newCommissionRate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Commission rate updated');
      fetchAffiliates();
      setShowCommissionDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update commission');
    }
  };

  const handleProcessPayouts = async () => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can process payouts');
      return;
    }

    setProcessingPayout(true);
    try {
      const response = await axios.post(`${API}/admin/affiliates/process-payouts`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Payouts processed: ${response.data.results.length} affiliates`);
      fetchAffiliates();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process payouts');
    } finally {
      setProcessingPayout(false);
    }
  };

  const viewApplication = (app) => {
    setSelectedApplication(app);
    setShowApplicationDialog(true);
  };

  const openCommissionDialog = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setNewCommissionRate(affiliate.commission_rate || 0.15);
    setShowCommissionDialog(true);
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  const totalEarnings = affiliates.reduce((sum, aff) => sum + (aff.total_earnings || 0), 0);
  const totalPending = affiliates.reduce((sum, aff) => sum + (aff.pending_earnings || 0), 0);
  const totalPaid = affiliates.reduce((sum, aff) => sum + (aff.paid_earnings || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Active Affiliates</span>
              <Users size={20} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              {affiliates.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Pending Apps</span>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              {pendingApplications.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Earnings</span>
              <DollarSign size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              ${totalEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Pending Payout</span>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              ${totalPending.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Action */}
      {isSuperAdmin && totalPending > 0 && (
        <Card style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'none' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                Monthly Payout Ready
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                ${totalPending.toFixed(2)} pending payout to {affiliates.filter(a => a.pending_earnings > 0).length} affiliates
              </div>
            </div>
            <Button onClick={handleProcessPayouts} disabled={processingPayout}>
              {processingPayout ? 'Processing...' : 'Process Payouts'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList>
          <TabsTrigger value="applications">
            Applications ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="affiliates">Active Affiliates ({affiliates.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>Review and approve affiliate applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
              ) : pendingApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No pending applications</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingApplications.map((app) => (
                    <div key={app._id} style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                          {app.user_name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          {app.user_email}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: app.role_type === 'coach' ? '#dbeafe' : '#fce7f3',
                            color: app.role_type === 'coach' ? '#1e40af' : '#be185d'
                          }}>
                            {app.role_type}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Applied: {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button onClick={() => viewApplication(app)} variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button onClick={() => handleApprove(app._id)} size="sm" style={{ background: '#10b981' }}>
                          <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Affiliates Tab */}
        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Active Affiliates</CardTitle>
              <CardDescription>Manage affiliate accounts and commission rates</CardDescription>
            </CardHeader>
            <CardContent>
              {affiliates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No active affiliates</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Affiliate
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Code
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Sales
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Total Earnings
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Pending
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Rate
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{affiliate.user_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{affiliate.user_email}</div>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            {affiliate.referral_code}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                            {affiliate.total_sales || 0}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600' }}>
                            ${(affiliate.total_earnings || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600', color: '#f59e0b' }}>
                            ${(affiliate.pending_earnings || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                            {((affiliate.commission_rate || 0.15) * 100).toFixed(0)}%
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {isSuperAdmin && (
                              <Button onClick={() => openCommissionDialog(affiliate)} variant="outline" size="sm">
                                Edit Rate
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <Card>
              <CardHeader>
                <CardTitle>Approved Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {approvedApplications.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No approved applications</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {approvedApplications.map((app) => (
                      <div key={app._id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{app.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Approved: {new Date(app.approved_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rejected Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedApplications.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No rejected applications</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {rejectedApplications.map((app) => (
                      <div key={app._id} style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{app.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Rejected: {new Date(app.rejected_at).toLocaleDateString()}
                        </div>
                        {app.rejection_reason && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            Reason: {app.rejection_reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent style={{ maxWidth: '600px' }}>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review affiliate application</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Label>Applicant</Label>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedApplication.user_name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedApplication.user_email}</div>
              </div>

              <div>
                <Label>Role Type</Label>
                <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: selectedApplication.role_type === 'coach' ? '#dbeafe' : '#fce7f3',
                    color: selectedApplication.role_type === 'coach' ? '#1e40af' : '#be185d'
                  }}>
                    {selectedApplication.role_type}
                  </span>
                </div>
              </div>

              <div>
                <Label>Basketball Experience</Label>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {selectedApplication.sport_experience}
                </div>
              </div>

              {selectedApplication.social_media_links && selectedApplication.social_media_links.length > 0 && (
                <div>
                  <Label>Social Media Links</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                    {selectedApplication.social_media_links.map((link, idx) => (
                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#3b82f6' }}>
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Motivation</Label>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {selectedApplication.motivation}
                </div>
              </div>

              <div>
                <Label>Rejection Reason (optional)</Label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button onClick={() => handleReject(selectedApplication._id)} variant="outline">
                  <XCircle size={16} style={{ marginRight: '0.5rem' }} />
                  Reject
                </Button>
                <Button onClick={() => handleApprove(selectedApplication._id)} style={{ background: '#10b981' }}>
                  <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commission Rate Dialog */}
      <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Commission Rate</DialogTitle>
            <DialogDescription>
              Set custom commission rate for {selectedAffiliate?.user_name}
            </DialogDescription>
          </DialogHeader>
          {selectedAffiliate && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Label>Current Rate</Label>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  {((selectedAffiliate.commission_rate || 0.15) * 100).toFixed(0)}%
                </div>
              </div>

              <div>
                <Label htmlFor="commission_rate">New Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={(newCommissionRate * 100).toFixed(1)}
                  onChange={(e) => setNewCommissionRate(parseFloat(e.target.value) / 100)}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Enter value between 0 and 100
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowCommissionDialog(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleUpdateCommission}>
                  Update Rate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AffiliateManagement;
