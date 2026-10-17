import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Award, Trophy, Medal, Star, Flame } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const res = await api.getLeaderboard();
      if (res.success && res.data?.leaderboard) {
        setLeaderboard(res.data.leaderboard);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '900px' }}>
      {/* Header Banner with Trophy Image */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div>
          <span className="badge badge-topic" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '0.6rem' }}>
            <Flame size={13} /> GLOBAL STUDENT STANDINGS
          </span>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
            QuizPulse <span className="gradient-text-gold">Hall of Champions</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', lineHeight: 1.5 }}>
            Recognizing the top learners who achieve highest cumulative assessment scores across all published quizzes.
          </p>
        </div>

        <img
          src="/assets/trophy.jpg"
          alt="Quiz Champion Trophy"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '1rem',
            objectFit: 'cover',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.3)',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Computing current student rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Trophy size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Leaderboard Data Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Be the first student to take a quiz and claim the #1 spot!</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem', width: '80px' }}>Rank</th>
                <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Quizzes Completed</th>
                <th style={{ padding: '0.75rem 1rem' }}>Average Accuracy</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item) => {
                let rankBadge = (
                  <span style={{ fontWeight: 700, color: 'var(--text-dim)', fontSize: '1rem' }}>
                    #{item.rank}
                  </span>
                );

                if (item.rank === 1) {
                  rankBadge = (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 800 }}>
                      <Trophy size={18} /> 1st
                    </div>
                  );
                } else if (item.rank === 2) {
                  rankBadge = (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#e2e8f0', fontWeight: 800 }}>
                      <Medal size={18} /> 2nd
                    </div>
                  );
                } else if (item.rank === 3) {
                  rankBadge = (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f97316', fontWeight: 800 }}>
                      <Medal size={18} /> 3rd
                    </div>
                  );
                }

                return (
                  <tr
                    key={item.studentId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: item.rank === 1 ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '1rem' }}>{rankBadge}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            background:
                              item.rank === 1
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {item.studentName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{item.studentName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {item.quizzesCompleted}
                    </td>
                    <td style={{ padding: '1rem', color: '#38bdf8', fontWeight: 600 }}>
                      {item.averagePercentage}%
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: item.rank === 1 ? '#fbbf24' : '#fff' }}>
                      {item.totalScore} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
