import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const RolesManagement = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'assign'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [customPermissions, setCustomPermissions] = useState([]);
  
  // Form state for creating new role
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch roles
      const rolesRes = await fetch(`${API_BASE_URL}/api/admin/roles`, { headers });
      const rolesData = await rolesRes.json();
      setRoles(rolesData);

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Fetch permissions
      const permsRes = await fetch(`${API_BASE_URL}/api/admin/permissions`, { headers });
      const permsData = await permsRes.json();
      setPermissions(permsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        alert('Role created successfully!');
        setShowCreateModal(false);
        setNewRole({ name: '', display_name: '', description: '', permissions: [] });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert('Please select a user and role');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/assign-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: selectedUser,
          role: selectedRole,
          permissions: customPermissions.length > 0 ? customPermissions : null
        })
      });

      if (response.ok) {
        alert('Role assigned successfully!');
        setShowAssignModal(false);
        setSelectedUser(null);
        setSelectedRole('');
        setCustomPermissions([]);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role');
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Role deleted successfully!');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    }
  };

  const togglePermission = (permission) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const toggleCustomPermission = (permission) => {
    setCustomPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (loading) {
    return <div className="p-4">Loading roles and permissions...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Roles & Permissions Management</h2>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'roles' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Manage Roles
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'assign' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            Assign Roles
          </button>
        </div>

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">System Roles</h3>
              <Button onClick={() => setShowCreateModal(true)}>Create New Role</Button>
            </div>

            <div className="grid gap-4">
              {roles.map(role => (
                <div key={role.id} className="border rounded-lg p-4 bg-white shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">
                        {role.display_name}
                        {role.is_system_role && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            System Role
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <div className="mt-2">
                        <p className="text-sm font-semibold mb-1">Permissions ({role.permissions.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 10).map(perm => (
                            <span key={perm} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {perm}
                            </span>
                          ))}
                          {role.permissions.length > 10 && (
                            <span className="text-xs text-gray-500">
                              +{role.permissions.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!role.is_system_role && (
                      <Button
                        onClick={() => handleDeleteRole(role.id, role.display_name)}
                        className="ml-4 bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assign Roles Tab */}
        {activeTab === 'assign' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Assign Role to User</h3>
            <Button onClick={() => setShowAssignModal(true)} className="mb-4">
              Assign Role
            </Button>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Current User Roles</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Current Role</th>
                      <th className="px-4 py-2 text-left">Permissions Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {roles.find(r => r.name === user.role)?.display_name || user.role}
                          </span>
                        </td>
                        <td className="px-4 py-2">{user.permissions?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Role</h3>
            <form onSubmit={handleCreateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Role Name (lowercase, no spaces)</label>
                  <Input
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g., assistant_coach"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Display Name</label>
                  <Input
                    value={newRole.display_name}
                    onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                    placeholder="e.g., Assistant Coach"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <Textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe the role's responsibilities"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Permissions</label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(permissions).map(([category, perms]) => (
                      <div key={category} className="border rounded p-3">
                        <h4 className="font-semibold mb-2 capitalize">
                          {category.replace(/_/g, ' ')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {perms.map(perm => (
                            <label key={perm} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newRole.permissions.includes(perm)}
                                onChange={() => togglePermission(perm)}
                                className="rounded"
                              />
                              <span>{perm.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRole({ name: '', display_name: '', description: '', permissions: [] });
                  }}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit">Create Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Assign Role to User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Select User</label>
                <select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Choose a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedRole && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Custom Permissions (Optional)
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      Leave empty to use role defaults
                    </span>
                  </label>
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-3">
                    {Object.entries(permissions).map(([category, perms]) => (
                      <div key={category}>
                        <h4 className="font-semibold mb-1 text-sm capitalize">
                          {category.replace(/_/g, ' ')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {perms.map(perm => (
                            <label key={perm} className="flex items-center space-x-2 text-xs">
                              <input
                                type="checkbox"
                                checked={customPermissions.includes(perm)}
                                onChange={() => toggleCustomPermission(perm)}
                                className="rounded"
                              />
                              <span>{perm.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setSelectedRole('');
                  setCustomPermissions([]);
                }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button onClick={handleAssignRole}>Assign Role</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManagement;
