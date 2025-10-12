import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Scores() {
  const [selectedDivision, setSelectedDivision] = useState('u14');

  const standings = {
    u14: [
      { rank: 1, team: 'Thunder Squad', wins: 12, losses: 2, pointsFor: 845, pointsAgainst: 678, streak: 'W5' },
      { rank: 2, team: 'Lightning Bolts', wins: 10, losses: 4, pointsFor: 812, pointsAgainst: 724, streak: 'W3' },
      { rank: 3, team: 'Storm Chasers', wins: 9, losses: 5, pointsFor: 789, pointsAgainst: 745, streak: 'L1' },
      { rank: 4, team: 'Blaze Warriors', wins: 8, losses: 6, pointsFor: 765, pointsAgainst: 758, streak: 'W2' },
      { rank: 5, team: 'Phoenix Rise', wins: 6, losses: 8, pointsFor: 734, pointsAgainst: 789, streak: 'L2' },
      { rank: 6, team: 'Tornado Twist', wins: 5, losses: 9, pointsFor: 698, pointsAgainst: 812, streak: 'W1' },
      { rank: 7, team: 'Hurricane Force', wins: 3, losses: 11, pointsFor: 654, pointsAgainst: 845, streak: 'L4' },
      { rank: 8, team: 'Cyclone Rush', wins: 2, losses: 12, pointsFor: 623, pointsAgainst: 873, streak: 'L6' }
    ],
    u16: [
      { rank: 1, team: 'Elite Mammoths', wins: 14, losses: 1, pointsFor: 956, pointsAgainst: 712, streak: 'W8' },
      { rank: 2, team: 'Apex Predators', wins: 11, losses: 4, pointsFor: 889, pointsAgainst: 765, streak: 'W4' },
      { rank: 3, team: 'Titan Force', wins: 10, losses: 5, pointsFor: 867, pointsAgainst: 789, streak: 'L1' },
      { rank: 4, team: 'Dynasty Kings', wins: 8, losses: 7, pointsFor: 823, pointsAgainst: 812, streak: 'W2' },
      { rank: 5, team: 'Legacy Warriors', wins: 7, losses: 8, pointsFor: 789, pointsAgainst: 834, streak: 'L3' },
      { rank: 6, team: 'Summit Climbers', wins: 5, losses: 10, pointsFor: 745, pointsAgainst: 878, streak: 'W1' },
      { rank: 7, team: 'Vanguard Squad', wins: 4, losses: 11, pointsFor: 712, pointsAgainst: 901, streak: 'L5' },
      { rank: 8, team: 'Rebel Alliance', wins: 1, losses: 14, pointsFor: 678, pointsAgainst: 948, streak: 'L9' }
    ],
    u18: [
      { rank: 1, team: 'Championship Elite', wins: 13, losses: 2, pointsFor: 1024, pointsAgainst: 823, streak: 'W7' },
      { rank: 2, team: 'Lockdown Defense', wins: 12, losses: 3, pointsFor: 989, pointsAgainst: 845, streak: 'W5' },
      { rank: 3, team: 'Fast Break Kings', wins: 10, losses: 5, pointsFor: 945, pointsAgainst: 878, streak: 'W3' },
      { rank: 4, team: 'Court Commanders', wins: 9, losses: 6, pointsFor: 912, pointsAgainst: 889, streak: 'L1' },
      { rank: 5, team: 'Hoop Dreams', wins: 7, losses: 8, pointsFor: 867, pointsAgainst: 912, streak: 'W2' },
      { rank: 6, team: 'Bucket Brigade', wins: 5, losses: 10, pointsFor: 823, pointsAgainst: 945, streak: 'L3' },
      { rank: 7, team: 'Slam Squad', wins: 3, losses: 12, pointsFor: 789, pointsAgainst: 989, streak: 'L6' },
      { rank: 8, team: 'Baseline Ballers', wins: 1, losses: 14, pointsFor: 745, pointsAgainst: 1024, streak: 'L10' }
    ]
  };

  const recentGames = [
    { date: '2025-10-10', home: 'Thunder Squad', homeScore: 72, away: 'Lightning Bolts', awayScore: 68, status: 'Final' },
    { date: '2025-10-10', home: 'Elite Mammoths', homeScore: 85, away: 'Apex Predators', awayScore: 79, status: 'Final' },
    { date: '2025-10-09', home: 'Storm Chasers', homeScore: 64, away: 'Blaze Warriors', awayScore: 61, status: 'Final' },
    { date: '2025-10-09', home: 'Championship Elite', homeScore: 91, away: 'Lockdown Defense', awayScore: 88, status: 'Final' },
    { date: '2025-10-08', home: 'Phoenix Rise', homeScore: 58, away: 'Tornado Twist', awayScore: 62, status: 'Final' }
  ];

  const upcomingGames = [
    { date: '2025-10-14', time: '18:00', home: 'Thunder Squad', away: 'Storm Chasers', location: 'Court A' },
    { date: '2025-10-14', time: '19:30', home: 'Elite Mammoths', away: 'Titan Force', location: 'Main Gym' },
    { date: '2025-10-15', time: '17:00', home: 'Lightning Bolts', away: 'Blaze Warriors', location: 'Court B' },
    { date: '2025-10-15', time: '18:30', home: 'Championship Elite', away: 'Fast Break Kings', location: 'Arena' },
    { date: '2025-10-16', time: '19:00', home: 'Phoenix Rise', away: 'Hurricane Force', location: 'Court A' }
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
            <Link to="/programs" className="navbar-link">Programs</Link>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Memberships ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/memberships/individual">Individual/Family</Link>
                <Link to="/memberships/team">Team/Group</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps">Camps</Link>
                <Link to="/clinics">Clinics</Link>
                <Link to="/workshops">Workshops</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Events ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars">Winter Wars Circuit</Link>
                <Link to="/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            <Link to="/scores" className="navbar-link">Scores</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '5rem 2rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Scores & Standings
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>
            Live scores, standings, and schedules for all MNASE leagues
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Tabs defaultValue="standings" className="w-full">
            <TabsList style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              background: '#f8f9ff',
              padding: '0.5rem',
              borderRadius: '12px',
              marginBottom: '3rem'
            }}>
              <TabsTrigger value="standings" data-testid="standings-tab" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                🏆 Standings
              </TabsTrigger>
              <TabsTrigger value="recent" data-testid="recent-tab" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                📊 Recent Games
              </TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="upcoming-tab" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                📅 Upcoming Games
              </TabsTrigger>
            </TabsList>

            {/* Standings Tab */}
            <TabsContent value="standings" data-testid="standings-content">
              {/* Division Selector */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                  onClick={() => setSelectedDivision('u14')}
                  data-testid="division-u14"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: selectedDivision === 'u14' ? 'none' : '2px solid #e8eeff',
                    background: selectedDivision === 'u14' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'white',
                    color: selectedDivision === 'u14' ? 'white' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  U14 Division
                </button>
                <button
                  onClick={() => setSelectedDivision('u16')}
                  data-testid="division-u16"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: selectedDivision === 'u16' ? 'none' : '2px solid #e8eeff',
                    background: selectedDivision === 'u16' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'white',
                    color: selectedDivision === 'u16' ? 'white' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  U16 Division
                </button>
                <button
                  onClick={() => setSelectedDivision('u18')}
                  data-testid="division-u18"
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: selectedDivision === 'u18' ? 'none' : '2px solid #e8eeff',
                    background: selectedDivision === 'u18' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'white',
                    color: selectedDivision === 'u18' ? 'white' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  U18 Division
                </button>
              </div>

              {/* Standings Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem', fontWeight: '600' }}>Rank</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem', fontWeight: '600' }}>Team</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}>W</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}>L</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}>PF</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}>PA</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings[selectedDivision].map((team, index) => (
                      <tr 
                        key={index}
                        data-testid={`team-row-${index}`}
                        style={{ 
                          borderBottom: '1px solid #e8eeff',
                          background: index % 2 === 0 ? 'white' : '#f8f9ff'
                        }}
                      >
                        <td style={{ padding: '1rem', fontWeight: '700', color: index < 3 ? '#dc2626' : '#64748b' }}>
                          {team.rank}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{team.team}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>{team.wins}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#ef4444', fontWeight: '600' }}>{team.losses}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{team.pointsFor}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{team.pointsAgainst}</td>
                        <td style={{ 
                          padding: '1rem', 
                          textAlign: 'center', 
                          fontWeight: '600',
                          color: team.streak.startsWith('W') ? '#10b981' : '#ef4444'
                        }}>
                          {team.streak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Recent Games Tab */}
            <TabsContent value="recent" data-testid="recent-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentGames.map((game, index) => (
                  <div 
                    key={index}
                    data-testid={`recent-game-${index}`}
                    style={{ 
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                      borderRadius: '12px',
                      border: '2px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                        {game.date} • {game.status}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>{game.home}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: game.homeScore > game.awayScore ? '#10b981' : '#64748b' }}>
                          {game.homeScore}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#64748b', margin: '0.5rem 0' }}>-</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: game.awayScore > game.homeScore ? '#10b981' : '#64748b' }}>
                          {game.awayScore}
                        </div>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>{game.away}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Upcoming Games Tab */}
            <TabsContent value="upcoming" data-testid="upcoming-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingGames.map((game, index) => (
                  <div 
                    key={index}
                    data-testid={`upcoming-game-${index}`}
                    style={{ 
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e8eeff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                        {game.date} at {game.time}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '600' }}>
                        📍 {game.location}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>{game.home}</div>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#64748b' }}>vs</div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>{game.away}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

export default Scores;