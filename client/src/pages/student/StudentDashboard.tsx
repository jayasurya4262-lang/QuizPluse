import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import {
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileQuestion,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [overviewRes, attemptsRes, quizzesRes] = await Promise.all([
        api.getStudentOverview(),
        api.getStudentAttempts(),
        api.getQuizzes(),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setStats(overviewRes.data);
      }
      if (attemptsRes.success && attemptsRes.data?.attempts) {
        setRecentAttempts(attemptsRes.data.attempts.slice(0, 5));
      }
      if (quizzesRes.success && quizzesRes.data?.quizzes) {
        setFeaturedQuizzes(quizzesRes.data.quizzes.slice(0, 3));
      }
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 27, 75, 0.6) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
          <span className="badge badge-topic" style={{ marginBottom: '0.75rem' }}>
            STUDENT ASSESSMENT PORTAL
          </span>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Track your ongoing progress, participate in scheduled assessments, and analyze your topic-wise mastery.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/quizzes" className="btn btn-primary">
              <BookOpen size={16} /> Browse Available Quizzes
            </Link>
            <Link to="/student/analytics" className="btn btn-secondary">
              <TrendingUp size={16} /> View Performance Trends
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          icon={<CheckCircle size={22} />}
          label="COMPLETED ASSESSMENTS"
          value={stats?.completedQuizzes ?? 0}
          subtext="Total quizzes submitted"
          color="#10b981"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="AVERAGE SCORE"
          value={`${stats?.averageScorePercentage ?? 0}%`}
          subtext="Across all attempts"
          color="#6366f1"
        />
        <StatCard
          icon={<Award size={22} />}
          label="PASS RATE"
          value={`${stats?.passRatePercentage ?? 0}%`}
          subtext="Passing threshold success"
          color="#06b6d4"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="TOTAL ATTEMPTS"
          value={stats?.totalAttempts ?? 0}
          subtext="Active assessment sessions"
          color="#8b5cf6"
        />
      </div>

      {/* Main Grid: Available Quizzes & Recent Attempts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Recommended Quizzes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Available Quizzes</h2>
            <Link to="/quizzes" style={{ fontSize: '0.85rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {featuredQuizzes.map((quiz) => (
              <div key={quiz.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-topic">{quiz.topic}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {quiz.durationMinutes} mins
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#fff' }}>
                  {quiz.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {quiz.description || 'Comprehensive assessment designed to test domain mastery.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {quiz.questionCount} Questions · {quiz.totalMarks} Marks
                  </span>
                  <Link to={`/quizzes/${quiz.id}`} className="btn btn-primary btn-sm">
                    View Quiz <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Recent Attempts</h2>
            <Link to="/student/attempts" style={{ fontSize: '0.85rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Full history <ArrowRight size={14} />
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <FileQuestion size={36} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem auto' }} />
              <p style={{ color: 'var(--text-muted)' }}>No completed attempts recorded yet.</p>
              <Link to="/quizzes" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Take Your First Quiz
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#fff' }}>{attempt.quizTitle}</h3>
                    <span className={`badge ${attempt.passed ? 'badge-pass' : 'badge-fail'}`}>
                      {attempt.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span>
                      Score: <strong style={{ color: '#fff' }}>{attempt.score}/{attempt.totalMarks}</strong> ({attempt.percentage}%)
                    </span>
                    <Link
                      to={`/results/${attempt.id}`}
                      style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                    >
                      Review Answers <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
