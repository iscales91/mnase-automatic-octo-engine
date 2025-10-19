import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Award, BarChart3 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Stats = () => {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState([]);
  const [gameStats, setGameStats] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leaders, setLeaders] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');
  const [selectedSeason, setSelectedSeason] = useState('2024-2025');
  const [leaderCategory, setLeaderCategory] = useState('points');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [selectedSeason]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch player stats
      const playersRes = await fetch(
        `${API_BASE_URL}/api/stats/players?season=${selectedSeason}`,
        { headers }
      );
      if (playersRes.ok) {
        const playersData = await playersRes.json();
        setPlayerStats(playersData);
      }

      // Fetch game stats
      const gamesRes = await fetch(
        `${API_BASE_URL}/api/stats/games?season=${selectedSeason}`,
        { headers }
      );
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setGameStats(gamesData);
      }

      // Fetch standings
      const standingsRes = await fetch(
        `${API_BASE_URL}/api/stats/standings?season=${selectedSeason}`,
        { headers }
      );
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json();
        setStandings(standingsData);
      }

      // Fetch leaders
      const leadersRes = await fetch(
        `${API_BASE_URL}/api/stats/leaders?stat_type=${leaderCategory}&season=${selectedSeason}&limit=10`,
        { headers }
      );
      if (leadersRes.ok) {
        const leadersData = await leadersRes.json();
        setLeaders(leadersData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const calculatePercentage = (made, attempted) => {
    if (attempted === 0) return '0.0';
    return ((made / attempted) * 100).toFixed(1);
  };

  const calculatePPG = (points, games) => {
    if (games === 0) return '0.0';
    return (points / games).toFixed(1);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading statistics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">League Statistics</h1>
          <p className="text-gray-600">MNASE Basketball League Stats & Standings</p>
        </div>

        {/* Season Selector */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-semibold">Season:</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            onClick={() => setActiveTab('players')}
            className={activeTab === 'players' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            Player Stats
          </Button>
          <Button
            onClick={() => setActiveTab('games')}
            className={activeTab === 'games' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            Game Results
          </Button>
          <Button
            onClick={() => setActiveTab('standings')}
            className={activeTab === 'standings' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            Team Standings
          </Button>
          <Button
            onClick={() => setActiveTab('leaders')}
            className={activeTab === 'leaders' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            League Leaders
          </Button>
        </div>

        {/* Player Stats Tab */}
        {activeTab === 'players' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 size={24} />
                Player Statistics
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Pos</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">GP</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">PTS</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">PPG</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">REB</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">AST</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">STL</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">BLK</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">FG%</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">3P%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {playerStats.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
                        No player statistics available for this season
                      </td>
                    </tr>
                  ) : (
                    playerStats.map((player, idx) => (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{player.player_name}</div>
                            {player.jersey_number && (
                              <div className="text-xs text-gray-500">#{player.jersey_number}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{player.team_name}</td>
                        <td className="px-4 py-3">{player.position || '-'}</td>
                        <td className="px-4 py-3 text-center">{player.games_played}</td>
                        <td className="px-4 py-3 text-center font-semibold">{player.points}</td>
                        <td className="px-4 py-3 text-center">{calculatePPG(player.points, player.games_played)}</td>
                        <td className="px-4 py-3 text-center">{player.total_rebounds}</td>
                        <td className="px-4 py-3 text-center">{player.assists}</td>
                        <td className="px-4 py-3 text-center">{player.steals}</td>
                        <td className="px-4 py-3 text-center">{player.blocks}</td>
                        <td className="px-4 py-3 text-center">
                          {calculatePercentage(player.field_goals_made, player.field_goals_attempted)}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          {calculatePercentage(player.three_pointers_made, player.three_pointers_attempted)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Game Results Tab */}
        {activeTab === 'games' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy size={24} className="text-yellow-500" />
                Game Results
              </h2>
              {gameStats.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No games recorded for this season</p>
              ) : (
                gameStats.map(game => (
                  <div key={game.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{game.game_date}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {game.game_type}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-right">
                        <div className="font-semibold text-lg">{game.home_team}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {game.home_score} - {game.away_score}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">{game.away_team}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      {game.location}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Team Standings Tab */}
        {activeTab === 'standings' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award size={24} />
                Team Standings
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Team</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">W</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">L</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Win %</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">PF</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">PA</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No team standings available for this season
                      </td>
                    </tr>
                  ) : (
                    standings.map((team, idx) => {
                      const totalGames = team.wins + team.losses;
                      const winPct = totalGames > 0 ? ((team.wins / totalGames) * 100).toFixed(1) : '0.0';
                      const diff = team.points_for - team.points_against;
                      
                      return (
                        <tr key={team.id} className={`hover:bg-gray-50 ${idx < 3 ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{team.team_name}</td>
                          <td className="px-4 py-3 text-center font-semibold text-green-600">{team.wins}</td>
                          <td className="px-4 py-3 text-center text-red-600">{team.losses}</td>
                          <td className="px-4 py-3 text-center">{winPct}%</td>
                          <td className="px-4 py-3 text-center">{team.points_for}</td>
                          <td className="px-4 py-3 text-center">{team.points_against}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaders Tab */}
        {activeTab === 'leaders' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-500" />
              League Leaders
            </h2>
            
            <div className="mb-4">
              <label className="font-semibold mr-2">Category:</label>
              <select
                value={leaderCategory}
                onChange={(e) => {
                  setLeaderCategory(e.target.value);
                  fetchStats();
                }}
                className="border rounded px-4 py-2"
              >
                <option value="points">Points</option>
                <option value="assists">Assists</option>
                <option value="total_rebounds">Rebounds</option>
                <option value="steals">Steals</option>
                <option value="blocks">Blocks</option>
                <option value="three_pointers_made">3-Pointers Made</option>
              </select>
            </div>

            <div className="space-y-3">
              {leaders.leaders && leaders.leaders.length > 0 ? (
                leaders.leaders.map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${idx < 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{player.player_name}</div>
                        <div className="text-sm text-gray-600">{player.team_name}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {player[leaderCategory]}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No leaders data available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
