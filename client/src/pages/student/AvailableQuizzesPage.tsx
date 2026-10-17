import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Search, Clock, Award, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

export const AvailableQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    const res = await api.getQuizzes({
      topic: selectedTopic,
      search: search.trim() || undefined,
    });
    if (res.success && res.data?.quizzes) {
      setQuizzes(res.data.quizzes);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, [selectedTopic]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuizzes();
  };

  const topics = ['all', 'Computer Science', 'Science', 'DevOps', 'General'];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Available Quizzes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Select an assessment to test your knowledge, earn points, and climb the leaderboard
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Topic Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className="btn btn-sm"
              style={{
                background: selectedTopic === t ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                color: selectedTopic === t ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? 'All Topics' : t}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="form-input"
            style={{ paddingLeft: '2.25rem', paddingRight: '1rem', fontSize: '0.875rem' }}
          />
          <Search
            size={16}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </form>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading available quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No quizzes found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            No quizzes match your selected filter or search keyword. Try clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-topic">{quiz.topic}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={13} /> {quiz.durationMinutes} min
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff', lineHeight: 1.3 }}>
                  {quiz.title}
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    marginBottom: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {quiz.description || 'Comprehensive timed assessment testing conceptual and practical application.'}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-dim)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <HelpCircle size={13} /> {quiz.questionCount} Questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={13} /> {quiz.totalMarks} Marks
                  </span>
                  {quiz.passingScore && (
                    <span style={{ color: '#34d399' }}>Pass: {quiz.passingScore}%</span>
                  )}
                </div>

                <Link
                  to={`/quizzes/${quiz.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View Details & Start <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
