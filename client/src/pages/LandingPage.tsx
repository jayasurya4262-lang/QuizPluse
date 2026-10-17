import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart,
  CheckCircle,
  Database,
  Award,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '4rem 0 3rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                }}
              >
                <Sparkles size={14} color="#6366f1" />
                <span>JIRA PROJECT TRIAL — SPRINT 1 TO 6 PRODUCTION RELEASE</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.03em',
                }}
              >
                Next-Gen Online Quiz & <span className="gradient-text">Assessment Platform</span>
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                }}
              >
                Engineered with React 18, Express REST APIs, and Neon Serverless PostgreSQL.
                Featuring authoritative timed assessments, instant automated grading, role-based controls,
                and comprehensive student & teacher analytics.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                {user ? (
                  <Link
                    to={user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'}
                    className="btn btn-primary btn-lg"
                  >
                    Open My Dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link to="/quizzes" className="btn btn-primary btn-lg">
                      Explore Quizzes <ArrowRight size={18} />
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                      Sign In to Demo
                    </Link>
                  </>
                )}
                <Link to="/leaderboard" className="btn btn-secondary btn-lg">
                  <Award size={18} color="#f59e0b" /> Leaderboard
                </Link>
              </div>

              {/* Tech Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Database size={12} /> Neon PostgreSQL
                </span>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <ShieldCheck size={12} /> JWT & RBAC
                </span>
                <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <Zap size={12} /> Instant Grading
                </span>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(99, 102, 241, 0.25)',
                }}
              >
                <img
                  src="/assets/hero_banner.jpg"
                  alt="QuizPulse EdTech Platform Hero"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo Access Box */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(30, 27, 75, 0.5) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: '#fff' }}>
                  ⚡ Quick Demo Evaluation Credentials
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Pre-seeded in Neon PostgreSQL with 4 comprehensive quizzes, attempts, and analytics:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: '#c084fc' }}>Teacher:</strong> teacher@quizpulse.com <span style={{ color: 'var(--text-dim)' }}>(Dr. Eleanor Vance)</span>
                  </div>
                  <div>
                    <strong style={{ color: '#38bdf8' }}>Student:</strong> student1@quizpulse.com <span style={{ color: 'var(--text-dim)' }}>(Alex Chen)</span>
                  </div>
                  <div>
                    <strong style={{ color: '#34d399' }}>Password:</strong> Password123!
                  </div>
                </div>
              </div>

              <Link to="/login" className="btn btn-primary">
                Login with 1-Click Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              Engineered for Academic Integrity & Performance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Every feature corresponds to Jira user stories from TRIAL-1 through TRIAL-41.
            </p>
          </div>

          <div className="grid-cols-3">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#6366f1' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Role-Based Access Control</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Strict role separation (STUDENT vs TEACHER) enforced directly at the API and database levels. Students cannot modify quizzes or access unsubmitted answer keys.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#06b6d4' }}>
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Authoritative Quiz Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Server-synchronized countdown timer, real-time incremental answer auto-saving, anti-cheat question palette navigation, and automated deadline submission.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#10b981' }}>
                <BarChart size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Full Analytics & CSV Export</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Teacher console provides score distribution histograms, question-level accuracy ratings to identify tough concepts, and instant CSV export of student attempts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
