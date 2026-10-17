import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import {
  ArrowLeft,
  Download,
  Users,
  CheckCircle,
  TrendingUp,
  BarChart,
  HelpCircle,
  ExternalLink,
  Search,
} from 'lucide-react';

export const QuizResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadQuizAnalytics() {
      if (!id) return;
      setLoading(true);
      const res = await api.getTeacherQuizAnalytics(id);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }

    loadQuizAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading participant results and assessment distributions...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Quiz Analytics Not Available</h2>
        <Link to="/teacher/quizzes" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back to Quizzes
        </Link>
      </div>
    );
  }

  const { quiz, metrics, distribution, questionAccuracy, participants } = data;

  const filteredParticipants = (participants || []).filter(
    (p: any) =>
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link
            to="/teacher/quizzes"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to My Quizzes
          </Link>
          <h1 style={{ fontSize: '2.25rem' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Assessment Analytics · {quiz.topic} · Pass Threshold: {quiz.passingScore}%
          </p>
        </div>

        {/* CSV Export Button (EPIC TRIAL-15) */}
        <a
          href={api.getExportCsvUrl(quiz.id)}
          download
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
        >
          <Download size={16} /> Export Results to CSV
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          icon={<Users size={22} />}
          label="TOTAL ATTEMPTS"
          value={metrics?.totalAttempts ?? 0}
          color="#8b5cf6"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="AVERAGE SCORE"
          value={`${metrics?.averagePercentage ?? 0}%`}
          color="#6366f1"
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          label="PASS RATE"
          value={`${metrics?.passRate ?? 0}%`}
          subtext={`${metrics?.passedCount ?? 0} Passed · ${metrics?.failedCount ?? 0} Failed`}
          color="#10b981"
        />
        <StatCard
          icon={<BarChart size={22} />}
          label="STATUS"
          value={quiz.status}
          color="#06b6d4"
        />
      </div>

      {/* Analytics Grid: Score Distribution & Question Accuracy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Score Distribution Histogram */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>
            Score Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(distribution || {}).map(([range, count]: [string, any]) => {
              const total = metrics?.totalAttempts || 1;
              const percentOfTotal = Math.round((count / total) * 100);

              return (
                <div key={range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>Bucket {range}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {count} {count === 1 ? 'student' : 'students'} ({percentOfTotal}%)
                    </span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentOfTotal}%`,
                        background:
                          range === '76-100%'
                            ? '#10b981'
                            : range === '51-75%'
                            ? '#6366f1'
                            : range === '26-50%'
                            ? '#f59e0b'
                            : '#f43f5e',
                        borderRadius: '5px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Level Accuracy */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>
            Question-Level Difficulty & Accuracy
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questionAccuracy?.map((qa: any, index: number) => {
              const isDifficult = qa.accuracyRate < 50;

              return (
                <div key={qa.questionId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      Q{index + 1}. {qa.questionText}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: isDifficult ? '#f43f5e' : '#10b981',
                      }}
                    >
                      {qa.accuracyRate}% Accuracy
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {qa.correctCount} correct out of {qa.totalAttempts} attempts · {qa.marks} Marks
                    {isDifficult && <span style={{ color: '#fb7185', marginLeft: '0.5rem' }}>⚠️ High Difficulty</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.25rem' }}>
              Student Participant Records ({filteredParticipants.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Full breakdown of marks, completion status, and evaluation timestamps
            </p>
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by student name..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2.5rem 0' }}>
            No matching participants found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Marks Earned</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Score %</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Outcome</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Submitted At</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p: any) => (
                  <tr key={p.attemptId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                      {p.studentName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {p.studentEmail}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {p.score} / {p.totalMarks}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: p.passed ? '#34d399' : '#fb7185' }}>
                      {p.percentage}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${p.passed ? 'badge-pass' : 'badge-fail'}`}>
                        {p.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                      {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={`/results/${p.attemptId}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Inspect <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
