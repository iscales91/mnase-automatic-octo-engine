import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [enrollmentForm, setEnrollmentForm] = useState({
    membership_id: '',
    auto_renew: false
  });

  useEffect(() => {
    fetchUsers();
    fetchMemberships();
  }, []);

  const fetchUsers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/admin/users`, { headers });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      const response = await axios.get(`${API}/memberships`);
      setMemberships(response.data);
    } catch (error) {
      console.error('Failed to load memberships');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/users/${userId}/role?role=${newRole}`, {}, { headers });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleEnrollMembership = async (e) => {
    e.preventDefault();
    if (!selectedUser || !enrollmentForm.membership_id) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/admin/user-memberships`, {
        user_id: selectedUser.id,
        membership_id: enrollmentForm.membership_id,
        auto_renew: enrollmentForm.auto_renew
      }, { headers });
      
      toast.success('User enrolled in membership');
      setShowEnrollDialog(false);
      setEnrollmentForm({ membership_id: '', auto_renew: false });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Enrollment failed');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '600' }}>User Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', borderRadius: '8px' }}>
            <Users size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            <strong>{users.length}</strong> Total Users
          </div>
          <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', borderRadius: '8px' }}>
            <Shield size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            <strong>{users.filter(u => u.role === 'admin').length}</strong> Admins
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }} data-testid={`user-row-${user.id}`}>
                  <td style={{ padding: '0.75rem' }} data-testid={`user-name-${user.id}`}>{user.name}</td>
                  <td style={{ padding: '0.75rem' }} data-testid={`user-email-${user.id}`}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger style={{ width: '120px' }} data-testid={`user-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.9rem' }} data-testid={`user-date-${user.id}`}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <Dialog open={showEnrollDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setShowEnrollDialog(open);
                      if (open) setSelectedUser(user);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid={`enroll-btn-${user.id}`}>
                          <UserCheck size={16} style={{ marginRight: '0.5rem' }} />
                          Enroll Membership
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid={`enroll-dialog-${user.id}`}>
                        <DialogHeader>
                          <DialogTitle>Enroll {user.name} in Membership</DialogTitle>
                          <DialogDescription>Select a membership tier to enroll this user</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEnrollMembership} className="space-y-4">
                          <div>
                            <Label>Membership Tier</Label>
                            <Select
                              value={enrollmentForm.membership_id}
                              onValueChange={(value) => setEnrollmentForm({...enrollmentForm, membership_id: value})}
                              required
                            >
                              <SelectTrigger data-testid="membership-select">
                                <SelectValue placeholder="Select membership" />
                              </SelectTrigger>
                              <SelectContent>
                                {memberships.map(m => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.tier} ({m.type}) - ${m.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              id="auto-renew"
                              checked={enrollmentForm.auto_renew}
                              onChange={(e) => setEnrollmentForm({...enrollmentForm, auto_renew: e.target.checked})}
                              data-testid="auto-renew-checkbox"
                            />
                            <Label htmlFor="auto-renew" style={{ marginBottom: 0 }}>Auto-renew annually</Label>
                          </div>
                          <Button type="submit" className="w-full" data-testid="confirm-enroll-btn">Enroll User</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;