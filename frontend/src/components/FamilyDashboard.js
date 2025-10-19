import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, User, Calendar, CreditCard, Activity } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FamilyDashboard = () => {
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [newChild, setNewChild] = useState({
    name: '',
    date_of_birth: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/family-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyData(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching family data:', error);
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/children`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newChild)
      });

      if (response.ok) {
        alert('Child account created successfully!');
        setShowAddChild(false);
        setNewChild({ name: '', date_of_birth: '', email: '', phone: '' });
        fetchFamilyData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to create child account'}`);
      }
    } catch (error) {
      console.error('Error adding child:', error);
      alert('Failed to add child account');
    }
  };

  if (loading) {
    return <div className="p-4">Loading family dashboard...</div>;
  }

  if (!familyData) {
    return <div className="p-4">No family data available</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Family Dashboard</h2>
        <p className="text-gray-600">Manage all your children's accounts and activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Children</p>
              <p className="text-2xl font-bold">{familyData.summary.total_children}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold">{familyData.summary.total_registrations}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Memberships</p>
              <p className="text-2xl font-bold">{familyData.summary.total_memberships}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold">{familyData.summary.pending_payments}</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Add Child Button */}
      <div className="mb-6">
        <Button onClick={() => setShowAddChild(!showAddChild)} className="flex items-center gap-2">
          <Plus size={20} />
          Add Child Account
        </Button>
      </div>

      {/* Add Child Form */}
      {showAddChild && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create Child Account</h3>
          <form onSubmit={handleAddChild} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Child's Name *</label>
                <Input
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth * (Must be under 18)</label>
                <Input
                  type="date"
                  value={newChild.date_of_birth}
                  onChange={(e) => setNewChild({ ...newChild, date_of_birth: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                <Input
                  type="email"
                  value={newChild.email}
                  onChange={(e) => setNewChild({ ...newChild, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                <Input
                  type="tel"
                  value={newChild.phone}
                  onChange={(e) => setNewChild({ ...newChild, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Child Account</Button>
              <Button
                type="button"
                onClick={() => setShowAddChild(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Children List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Children & Activities</h3>
        
        {familyData.children.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No child accounts yet. Click "Add Child Account" to get started.</p>
          </div>
        ) : (
          familyData.children.map(child => (
            <div key={child.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold">{child.name}</h4>
                    <p className="text-sm opacity-90">Born: {child.date_of_birth}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedChild(selectedChild === child.id ? null : child.id)}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    {selectedChild === child.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{child.registrations_count}</p>
                    <p className="text-sm text-gray-600">Registrations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{child.memberships_count}</p>
                    <p className="text-sm text-gray-600">Memberships</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{child.pending_payments}</p>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                  </div>
                </div>

                {selectedChild === child.id && (
                  <div className="border-t pt-4">
                    {/* Registrations */}
                    {child.registrations && child.registrations.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold mb-2">Registrations</h5>
                        <div className="space-y-2">
                          {child.registrations.map((reg, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <p className="font-medium">{reg.program_name || 'Program'}</p>
                              <p className="text-sm text-gray-600">
                                Status: <span className={`font-medium ${reg.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>
                                  {reg.status}
                                </span>
                                {' | '}
                                Payment: {reg.payment_status}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Memberships */}
                    {child.memberships && child.memberships.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2">Memberships</h5>
                        <div className="space-y-2">
                          {child.memberships.map((mem, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <p className="font-medium capitalize">{mem.tier} {mem.membership_type}</p>
                              <p className="text-sm text-gray-600">
                                Status: {mem.status} | ${mem.price}/{mem.billing_cycle}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {child.registrations_count === 0 && child.memberships_count === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No activities yet for this child
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;
