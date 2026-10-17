import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { History, Award, Clock, ArrowRight, ExternalLink } from 'lucide-react';

export const AttemptHistoryPage: React.FC = () => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true);
      const res = await api.getStudentAttempts();
      if (res.success && res.data?.attempts) {
        setAttempts(res.data.attempts);
      }
      setLoading(false);
    }

    fetchAttempts();
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Assessment History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Chronological record of all submitted and evaluated quiz sessions
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading assessment records...
        </div>
      ) : attempts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <History size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No attempts found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You haven't participated in any quizzes yet. Explore available quizzes to get started!
          </p>
          <Link to="/quizzes" className="btn btn-primary">
            Browse Quizzes
          </Link>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Quiz Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Topic</th>
                <th style={{ padding: '0.75rem 1rem' }}>Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Percentage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((att) => {
                const dateStr = att.submittedAt
                  ? new Date(att.submittedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A';

                return (
                  <tr
                    key={att.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {att.quizTitle}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-topic">{att.topic}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {att.score} / {att.totalMarks}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 700, color: att.passed ? '#34d399' : '#fb7185' }}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${att.passed ? 'badge-pass' : 'badge-fail'}`}>
                        {att.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {dateStr}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to={`/results/${att.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        Review <ExternalLink size={13} />
                      </Link>
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
