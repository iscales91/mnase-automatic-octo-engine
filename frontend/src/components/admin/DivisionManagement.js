import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState('all');
  
  const token = localStorage.getItem('token');

  const [divisionForm, setDivisionForm] = useState({
    program_id: '',
    name: '',
    age_range: '',
    gender: 'any',
    capacity: '',
    description: '',
    price_override: '',
    schedule_override: '',
    active: true
  });

  useEffect(() => {
    fetchPrograms();
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (selectedProgram === 'all') {
      fetchDivisions();
    } else {
      fetchDivisionsByProgram(selectedProgram);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      setPrograms(response.data);
    } catch (error) {
      toast.error('Failed to load programs');
    }
  };

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/divisions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDivisions(response.data);
    } catch (error) {
      toast.error('Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisionsByProgram = async (programId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/programs/${programId}/divisions`);
      setDivisions(response.data);
    } catch (error) {
      toast.error('Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        ...divisionForm,
        capacity: divisionForm.capacity ? parseInt(divisionForm.capacity) : null,
        price_override: divisionForm.price_override ? parseFloat(divisionForm.price_override) : null
      };

      if (editingDivision) {
        await axios.put(`${API}/divisions/${editingDivision.id}`, payload, { headers });
        toast.success('Division updated successfully');
      } else {
        await axios.post(`${API}/divisions`, payload, { headers });
        toast.success('Division created successfully');
      }

      setShowDialog(false);
      setEditingDivision(null);
      resetForm();
      fetchDivisions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (division) => {
    setEditingDivision(division);
    setDivisionForm({
      program_id: division.program_id,
      name: division.name,
      age_range: division.age_range,
      gender: division.gender || 'any',
      capacity: division.capacity || '',
      description: division.description || '',
      price_override: division.price_override || '',
      schedule_override: division.schedule_override || '',
      active: division.active
    });
    setShowDialog(true);
  };

  const handleDelete = async (divisionId) => {
    if (!window.confirm('Are you sure you want to delete this division?')) return;

    try {
      await axios.delete(`${API}/divisions/${divisionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Division deleted successfully');
      fetchDivisions();
    } catch (error) {
      toast.error('Failed to delete division');
    }
  };

  const resetForm = () => {
    setDivisionForm({
      program_id: '',
      name: '',
      age_range: '',
      gender: 'any',
      capacity: '',
      description: '',
      price_override: '',
      schedule_override: '',
      active: true
    });
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Division Management</h2>
          <p className="text-gray-600">Manage program divisions and teams</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingDivision(null); }}>
              <Plus className="mr-2" size={20} />
              Add Division
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDivision ? 'Edit Division' : 'Create New Division'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Program *</Label>
                <select
                  value={divisionForm.program_id}
                  onChange={(e) => setDivisionForm({...divisionForm, program_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={editingDivision} // Can't change program when editing
                >
                  <option value="">Select a program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {program.season}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Division Name *</Label>
                  <Input
                    value={divisionForm.name}
                    onChange={(e) => setDivisionForm({...divisionForm, name: e.target.value})}
                    placeholder="e.g., U12 Boys, U14 Girls"
                    required
                  />
                </div>
                <div>
                  <Label>Age Range *</Label>
                  <Input
                    value={divisionForm.age_range}
                    onChange={(e) => setDivisionForm({...divisionForm, age_range: e.target.value})}
                    placeholder="e.g., 10-12, 13-15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <select
                    value={divisionForm.gender}
                    onChange={(e) => setDivisionForm({...divisionForm, gender: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="any">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="co-ed">Co-Ed</option>
                  </select>
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={divisionForm.capacity}
                    onChange={(e) => setDivisionForm({...divisionForm, capacity: e.target.value})}
                    placeholder="Maximum participants"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={divisionForm.description}
                  onChange={(e) => setDivisionForm({...divisionForm, description: e.target.value})}
                  placeholder="Additional information about this division"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price Override (optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={divisionForm.price_override}
                    onChange={(e) => setDivisionForm({...divisionForm, price_override: e.target.value})}
                    placeholder="Leave empty to use program price"
                  />
                  <p className="text-xs text-gray-500 mt-1">Override program price if different</p>
                </div>
                <div>
                  <Label>Schedule Override (optional)</Label>
                  <Input
                    value={divisionForm.schedule_override}
                    onChange={(e) => setDivisionForm({...divisionForm, schedule_override: e.target.value})}
                    placeholder="Custom schedule"
                  />
                  <p className="text-xs text-gray-500 mt-1">Override program schedule if different</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={divisionForm.active}
                  onChange={(e) => setDivisionForm({...divisionForm, active: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="active" className="cursor-pointer">Active (visible to users)</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDivision ? 'Update' : 'Create'} Division
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Program */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <Label>Filter by Program</Label>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="w-full md:w-64 border rounded px-3 py-2 mt-2"
        >
          <option value="all">All Programs</option>
          {programs.map(program => (
            <option key={program.id} value={program.id}>
              {program.name} - {program.season}
            </option>
          ))}
        </select>
      </div>

      {/* Divisions List */}
      {loading ? (
        <div className="text-center py-12">Loading divisions...</div>
      ) : divisions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No divisions found. Create your first division!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((division) => (
            <div
              key={division.id}
              className={`bg-white rounded-lg shadow p-6 ${!division.active ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{division.name}</h3>
                  <p className="text-sm text-gray-600">{getProgramName(division.program_id)}</p>
                </div>
                {!division.active && (
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Age Range:</span>
                  <span>{division.age_range}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Gender:</span>
                  <span className="capitalize">{division.gender || 'Any'}</span>
                </div>
                {division.capacity && (
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{division.current_enrollment || 0} / {division.capacity}</span>
                  </div>
                )}
                {division.price_override && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Price:</span>
                    <span>${division.price_override.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {division.description && (
                <p className="text-sm text-gray-600 mb-4">{division.description}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(division)}
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(division.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DivisionManagement;
