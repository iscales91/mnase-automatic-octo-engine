import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showRosterDialog, setShowRosterDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const token = localStorage.getItem('token');

  const [teamForm, setTeamForm] = useState({
    name: '',
    division: '',
    age_group: '',
    season: '',
    coach_name: '',
    coach_email: '',
    coach_phone: '',
    max_roster_size: '15',
    practice_schedule: '',
    home_venue: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchAllRegistrations();
  }, []);

  const fetchTeams = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/admin/teams`, { headers });
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [youthRes, adultRes] = await Promise.all([
        axios.get(`${API}/admin/enhanced-registrations`, { headers }),
        axios.get(`${API}/admin/adult-registrations`, { headers })
      ]);
      setAllRegistrations([...youthRes.data, ...adultRes.data]);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    }
  };

  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingTeam) {
        await axios.put(`${API}/admin/teams/${editingTeam.id}`, teamForm, { headers });
        toast.success('Team updated successfully');
      } else {
        await axios.post(`${API}/admin/teams`, teamForm, { headers });
        toast.success('Team created successfully');
      }
      
      setShowTeamDialog(false);
      setEditingTeam(null);
      setTeamForm({ name: '', division: '', age_group: '', season: '', coach_name: '', coach_email: '', coach_phone: '', max_roster_size: '15', practice_schedule: '', home_venue: '' });
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      division: team.division,
      age_group: team.age_group,
      season: team.season,
      coach_name: team.coach_name,
      coach_email: team.coach_email,
      coach_phone: team.coach_phone,
      max_roster_size: team.max_roster_size.toString(),
      practice_schedule: team.practice_schedule || '',
      home_venue: team.home_venue || ''
    });
    setShowTeamDialog(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/admin/teams/${teamId}`, { headers });
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  const handleManageRoster = (team) => {
    setSelectedTeam(team);
    setShowRosterDialog(true);
  };

  const handleAddPlayerToTeam = async (registrationId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/admin/teams/${selectedTeam.id}/players`, { registration_id: registrationId }, { headers });
      toast.success('Player added to team');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add player');
    }
  };

  const handleRemovePlayerFromTeam = async (playerId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/admin/teams/${selectedTeam.id}/players/${playerId}`, { headers });
      toast.success('Player removed from team');
      fetchTeams();
      setSelectedTeam(teams.find(t => t.id === selectedTeam.id));
    } catch (error) {
      toast.error('Failed to remove player');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Teams Management</h2>
        <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-team">
              <Plus size={20} style={{ marginRight: '0.5rem' }} />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent style={{ maxWidth: '700px' }}>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                    placeholder="e.g., Thunder Squad"
                    required
                  />
                </div>
                <div>
                  <Label>Division *</Label>
                  <Select value={teamForm.division} onValueChange={(value) => setTeamForm({...teamForm, division: value})}>
                    <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="U10">U10</SelectItem>
                      <SelectItem value="U12">U12</SelectItem>
                      <SelectItem value="U14">U14</SelectItem>
                      <SelectItem value="U16">U16</SelectItem>
                      <SelectItem value="U18">U18</SelectItem>
                      <SelectItem value="Adult">Adult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Age Group *</Label>
                  <Input
                    value={teamForm.age_group}
                    onChange={(e) => setTeamForm({...teamForm, age_group: e.target.value})}
                    placeholder="e.g., 13-14 years"
                    required
                  />
                </div>
                <div>
                  <Label>Season *</Label>
                  <Input
                    value={teamForm.season}
                    onChange={(e) => setTeamForm({...teamForm, season: e.target.value})}
                    placeholder="e.g., Fall 2025"
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>Coach Name *</Label>
                  <Input
                    value={teamForm.coach_name}
                    onChange={(e) => setTeamForm({...teamForm, coach_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Coach Email</Label>
                  <Input
                    type="email"
                    value={teamForm.coach_email}
                    onChange={(e) => setTeamForm({...teamForm, coach_email: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Coach Phone</Label>
                  <Input
                    type="tel"
                    value={teamForm.coach_phone}
                    onChange={(e) => setTeamForm({...teamForm, coach_phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Max Roster Size</Label>
                  <Input
                    type="number"
                    value={teamForm.max_roster_size}
                    onChange={(e) => setTeamForm({...teamForm, max_roster_size: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Practice Schedule</Label>
                <Textarea
                  value={teamForm.practice_schedule}
                  onChange={(e) => setTeamForm({...teamForm, practice_schedule: e.target.value})}
                  placeholder="e.g., Mondays & Wednesdays 6-8pm"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Home Venue</Label>
                <Input
                  value={teamForm.home_venue}
                  onChange={(e) => setTeamForm({...teamForm, home_venue: e.target.value})}
                  placeholder="e.g., Main Gymnasium"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="outline" onClick={() => setShowTeamDialog(false)}>Cancel</Button>
                <Button type="submit">{editingTeam ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {teams.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No teams yet. Create your first team!
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              data-testid={`team-${team.id}`}
              style={{
                padding: '1.5rem',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #e8eeff',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>{team.name}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {team.division} • {team.age_group}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {team.season}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => handleEditTeam(team)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTeam(team.id)} style={{ color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Coach: {team.coach_name}</div>
                {team.coach_email && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>📧 {team.coach_email}</div>}
                {team.coach_phone && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>📞 {team.coach_phone}</div>}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                  Roster: {team.players?.length || 0} / {team.max_roster_size}
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: team.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: team.status === 'active' ? '#166534' : '#991b1b',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {team.status}
                </div>
              </div>
              
              <Button 
                style={{ width: '100%' }}
                onClick={() => handleManageRoster(team)}
              >
                <Users size={16} style={{ marginRight: '0.5rem' }} />
                Manage Roster
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Roster Management Dialog */}
      <Dialog open={showRosterDialog} onOpenChange={setShowRosterDialog}>
        <DialogContent style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Manage Roster - {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedTeam && (
            <Tabs defaultValue="current" className="w-full">
              <TabsList>
                <TabsTrigger value="current">Current Roster ({selectedTeam.players?.length || 0})</TabsTrigger>
                <TabsTrigger value="add">Add Players</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                {selectedTeam.players && selectedTeam.players.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedTeam.players.map((player) => (
                      <div
                        key={player.id}
                        style={{
                          padding: '1rem',
                          background: '#f8f9ff',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{player.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {player.position || 'No position'} • Jersey #{player.jersey_number || 'TBD'}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePlayerFromTeam(player.id)}
                          style={{ color: '#ef4444' }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No players on this team yet. Add players from the "Add Players" tab.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="add">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {allRegistrations
                    .filter(reg => reg.status === 'approved' && !selectedTeam.players?.some(p => p.registration_id === reg.id))
                    .map((reg) => (
                      <div
                        key={reg.id}
                        style={{
                          padding: '1rem',
                          background: 'white',
                          border: '1px solid #e8eeff',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>
                            {reg.athlete_first_name ? `${reg.athlete_first_name} ${reg.athlete_last_name}` : reg.participant_name}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {reg.skill_level ? `Skill: ${reg.skill_level}` : ''} • {reg.position || 'No position specified'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddPlayerToTeam(reg.id)}
                        >
                          Add to Team
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamsManagement;