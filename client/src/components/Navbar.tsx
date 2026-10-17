import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Award,
  BarChart3,
  PlusCircle,
  LogOut,
  Menu,
  X,
  History,
  GraduationCap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to={isTeacher ? '/teacher/dashboard' : isStudent ? '/student/dashboard' : '/'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <img
            src="/assets/logo.jpg"
            alt="QuizPulse Logo"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.625rem',
              objectFit: 'cover',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              QuizPulse <Sparkles size={16} color="#6366f1" />
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              ASSESSMENT ENGINE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          className="desktop-nav"
        >
          {!user && (
            <>
              <Link
                to="/quizzes"
                style={{
                  color: isActive('/quizzes') ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                Explore Quizzes
              </Link>
              <Link
                to="/leaderboard"
                style={{
                  color: isActive('/leaderboard') ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                Leaderboard
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/student/dashboard') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <LayoutDashboard size={17} /> Dashboard
              </Link>
              <Link
                to="/quizzes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/quizzes') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <BookOpen size={17} /> Available Quizzes
              </Link>
              <Link
                to="/student/attempts"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/student/attempts') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <History size={17} /> History
              </Link>
              <Link
                to="/student/analytics"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/student/analytics') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <BarChart3 size={17} /> Analytics
              </Link>
              <Link
                to="/leaderboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/leaderboard') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <Award size={17} /> Leaderboard
              </Link>
            </>
          )}

          {isTeacher && (
            <>
              <Link
                to="/teacher/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/teacher/dashboard') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <LayoutDashboard size={17} /> Teacher Console
              </Link>
              <Link
                to="/teacher/quizzes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/teacher/quizzes') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <BookOpen size={17} /> My Quizzes
              </Link>
              <Link
                to="/teacher/quizzes/create"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/teacher/quizzes/create') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <PlusCircle size={17} /> Create Quiz
              </Link>
              <Link
                to="/leaderboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/leaderboard') ? '#6366f1' : 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.925rem',
                }}
              >
                <Award size={17} /> Leaderboard
              </Link>
            </>
          )}
        </div>

        {/* Right Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '1.85rem',
                    height: '1.85rem',
                    borderRadius: '50%',
                    background: isTeacher
                      ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                      : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: '#fff',
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                    {user.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: isTeacher ? '#c084fc' : '#38bdf8',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.5rem',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Dashboard
              </Link>
              <Link
                to="/quizzes"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Available Quizzes
              </Link>
              <Link
                to="/student/attempts"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                My Attempts
              </Link>
              <Link
                to="/student/analytics"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Analytics
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Leaderboard
              </Link>
            </>
          )}

          {isTeacher && (
            <>
              <Link
                to="/teacher/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Teacher Dashboard
              </Link>
              <Link
                to="/teacher/quizzes"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                My Quizzes
              </Link>
              <Link
                to="/teacher/quizzes/create"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Create Quiz
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Leaderboard
              </Link>
            </>
          )}

          {!user && (
            <>
              <Link
                to="/quizzes"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Quizzes
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#fff', fontWeight: 500 }}
              >
                Leaderboard
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#6366f1', fontWeight: 600 }}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
