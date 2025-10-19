import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const StatsManagement = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const [newPlayer, setNewPlayer] = useState({
    player_name: '',
    team_name: '',
    jersey_number: '',
    position: '',
    season: '2024-2025'
  });

  const [newGame, setNewGame] = useState({
    game_date: '',
    home_team: '',
    away_team: '',
    home_score: '',
    away_score: '',
    location: '',
    game_type: 'regular',
    season: '2024-2025'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const playersRes = await fetch(`${API_BASE_URL}/api/stats/players`, { headers });
      if (playersRes.ok) {
        const playersData = await playersRes.json();
        setPlayerStats(playersData);
      }

      const gamesRes = await fetch(`${API_BASE_URL}/api/stats/games`, { headers });
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setGames(gamesData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/stats/players`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPlayer)
      });

      if (response.ok) {
        alert('Player added successfully!');
        setShowAddPlayer(false);
        setNewPlayer({ player_name: '', team_name: '', jersey_number: '', position: '', season: '2024-2025' });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add player'}`);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player');
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const gameData = {
        ...newGame,
        home_score: parseInt(newGame.home_score),
        away_score: parseInt(newGame.away_score)
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/stats/games`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });

      if (response.ok) {
        alert('Game added successfully!');
        setShowAddGame(false);
        setNewGame({
          game_date: '',
          home_team: '',
          away_team: '',
          home_score: '',
          away_score: '',
          location: '',
          game_type: 'regular',
          season: '2024-2025'
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add game'}`);
      }
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Failed to add game');
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Delete ${playerName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/stats/players/${playerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Player deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Delete this game?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/stats/games/${gameId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Game deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  };

  if (loading) {
    return <div className="p-4">Loading stats management...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Stats Management</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setActiveTab('players')}
          className={activeTab === 'players' ? 'bg-blue-600' : 'bg-gray-300'}
        >
          Players
        </Button>
        <Button
          onClick={() => setActiveTab('games')}
          className={activeTab === 'games' ? 'bg-blue-600' : 'bg-gray-300'}
        >
          Games
        </Button>
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div>
          <Button onClick={() => setShowAddPlayer(!showAddPlayer)} className="mb-4 flex items-center gap-2">
            <Plus size={20} />
            Add Player
          </Button>

          {showAddPlayer && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Player</h3>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Player Name"
                    value={newPlayer.player_name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, player_name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Team Name"
                    value={newPlayer.team_name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, team_name: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Jersey Number"
                    value={newPlayer.jersey_number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jersey_number: e.target.value })}
                  />
                  <select
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select Position</option>
                    <option value="PG">Point Guard (PG)</option>
                    <option value="SG">Shooting Guard (SG)</option>
                    <option value="SF">Small Forward (SF)</option>
                    <option value="PF">Power Forward (PF)</option>
                    <option value="C">Center (C)</option>
                  </select>
                  <Input
                    placeholder="Season (e.g., 2024-2025)"
                    value={newPlayer.season}
                    onChange={(e) => setNewPlayer({ ...newPlayer, season: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Player</Button>
                  <Button type="button" onClick={() => setShowAddPlayer(false)} className="bg-gray-500">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Season</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map(player => (
                  <tr key={player.id} className="border-t">
                    <td className="px-4 py-2">
                      {player.player_name}
                      {player.jersey_number && ` #${player.jersey_number}`}
                    </td>
                    <td className="px-4 py-2">{player.team_name}</td>
                    <td className="px-4 py-2">{player.position || '-'}</td>
                    <td className="px-4 py-2">{player.season}</td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        onClick={() => handleDeletePlayer(player.id, player.player_name)}
                        className="bg-red-500 hover:bg-red-600"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div>
          <Button onClick={() => setShowAddGame(!showAddGame)} className="mb-4 flex items-center gap-2">
            <Plus size={20} />
            Add Game
          </Button>

          {showAddGame && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Game</h3>
              <form onSubmit={handleAddGame} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={newGame.game_date}
                    onChange={(e) => setNewGame({ ...newGame, game_date: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Home Team"
                    value={newGame.home_team}
                    onChange={(e) => setNewGame({ ...newGame, home_team: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Home Score"
                    value={newGame.home_score}
                    onChange={(e) => setNewGame({ ...newGame, home_score: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Away Team"
                    value={newGame.away_team}
                    onChange={(e) => setNewGame({ ...newGame, away_team: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Away Score"
                    value={newGame.away_score}
                    onChange={(e) => setNewGame({ ...newGame, away_score: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Location"
                    value={newGame.location}
                    onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
                    required
                  />
                  <select
                    value={newGame.game_type}
                    onChange={(e) => setNewGame({ ...newGame, game_type: e.target.value })}
                    className="border rounded px-3 py-2"
                  >
                    <option value="regular">Regular Season</option>
                    <option value="playoff">Playoff</option>
                    <option value="tournament">Tournament</option>
                    <option value="championship">Championship</option>
                  </select>
                  <Input
                    placeholder="Season (e.g., 2024-2025)"
                    value={newGame.season}
                    onChange={(e) => setNewGame({ ...newGame, season: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Game</Button>
                  <Button type="button" onClick={() => setShowAddGame(false)} className="bg-gray-500">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Home Team</th>
                  <th className="px-4 py-2 text-center">Score</th>
                  <th className="px-4 py-2 text-left">Away Team</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr key={game.id} className="border-t">
                    <td className="px-4 py-2">{game.game_date}</td>
                    <td className="px-4 py-2">{game.home_team}</td>
                    <td className="px-4 py-2 text-center font-semibold">
                      {game.home_score} - {game.away_score}
                    </td>
                    <td className="px-4 py-2">{game.away_team}</td>
                    <td className="px-4 py-2">{game.location}</td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        onClick={() => handleDeleteGame(game.id)}
                        className="bg-red-500 hover:bg-red-600"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsManagement;
