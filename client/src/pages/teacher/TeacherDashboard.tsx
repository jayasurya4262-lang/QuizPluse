import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import {
  BookOpen,
  PlusCircle,
  Users,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  BarChart,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      const res = await api.getTeacherOverview();
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }

    fetchOverview();
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Teacher Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)', marginBottom: '0.75rem' }}>
          TEACHER & INSTRUCTOR CONSOLE
        </span>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
          Welcome, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Create assessments, configure question weights and answer keys, review participant distributions,
          and export student grade reports.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/teacher/quizzes/create" className="btn btn-primary">
            <PlusCircle size={16} /> Create New Quiz
          </Link>
          <Link to="/teacher/quizzes" className="btn btn-secondary">
            <BookOpen size={16} /> Manage My Quizzes
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          icon={<BookOpen size={22} />}
          label="TOTAL QUIZZES"
          value={data?.totalQuizzes ?? 0}
          subtext={`${data?.publishedQuizzes ?? 0} published · ${data?.draftQuizzes ?? 0} drafts`}
          color="#8b5cf6"
        />
        <StatCard
          icon={<Users size={22} />}
          label="STUDENT ATTEMPTS"
          value={data?.totalAttempts ?? 0}
          subtext={`${data?.uniqueStudents ?? 0} unique participants`}
          color="#06b6d4"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="CLASS AVERAGE"
          value={`${data?.averageScorePercentage ?? 0}%`}
          subtext="Mean score across all quizzes"
          color="#10b981"
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          label="PUBLISHED ASSESSMENTS"
          value={data?.publishedQuizzes ?? 0}
          subtext="Live for student taking"
          color="#6366f1"
        />
      </div>

      {/* Recent Student Submissions */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.25rem' }}>
              Recent Student Submissions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Real-time feed of completed attempts on quizzes owned by you
            </p>
          </div>
          <Link to="/teacher/quizzes" className="btn btn-secondary btn-sm">
            View All Quizzes <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>
            Loading student submissions...
          </p>
        ) : !data?.recentAttempts || data.recentAttempts.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>
            No student submissions recorded yet. Once students submit attempts, their results will appear here.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Quiz Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Score</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Percentage</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttempts.map((item: any) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                      {item.studentName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.studentEmail}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc', fontSize: '0.9rem' }}>
                      {item.quizTitle}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {item.score} / {item.totalMarks}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: item.passed ? '#34d399' : '#fb7185' }}>
                      {item.percentage}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${item.passed ? 'badge-pass' : 'badge-fail'}`}>
                        {item.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={`/results/${item.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Inspect Result <ExternalLink size={12} />
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
