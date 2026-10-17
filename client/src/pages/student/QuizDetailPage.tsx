import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Award,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

export const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (!id) return;
      setLoading(true);
      const res = await api.getQuiz(id);
      if (res.success && res.data?.quiz) {
        setQuiz(res.data.quiz);
      } else {
        setError(res.message || 'Quiz not found');
      }
      setLoading(false);
    }

    loadQuiz();
  }, [id]);

  const handleStartAttempt = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/quizzes/${id}` } } });
      return;
    }

    if (user.role === 'TEACHER') {
      alert('Teachers cannot take quizzes as students. Please log in as a student to participate.');
      return;
    }

    setStarting(true);
    setError(null);

    const res = await api.startAttempt(id!);
    setStarting(false);

    if (res.success && res.data?.attempt) {
      navigate(`/quiz/${id}/attempt/${res.data.attempt.id}`);
    } else {
      setError(res.message || 'Failed to start quiz attempt.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading quiz instructions...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem' }}>
          <AlertTriangle size={36} color="#f43f5e" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Unable to Load Quiz</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || 'The requested assessment is unavailable.'}
          </p>
          <Link to="/quizzes" className="btn btn-secondary">
            ← Return to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <Link
        to="/quizzes"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Quizzes
      </Link>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-topic">{quiz.topic}</span>
            <span className="badge badge-published">ONLINE ASSESSMENT</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>
            {quiz.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            {quiz.description || 'Test your proficiency with this timed, curriculum-aligned assessment.'}
          </p>
        </div>

        {/* Assessment Specs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Duration
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
              <Clock size={16} color="#6366f1" /> {quiz.durationMinutes} Minutes
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Questions
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
              <HelpCircle size={16} color="#06b6d4" /> {quiz.questions?.length || 0} Total
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Total Marks
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
              <Award size={16} color="#10b981" /> {quiz.totalMarks} Marks
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Pass Threshold
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
              <ShieldCheck size={16} /> {quiz.passingScore ? `${quiz.passingScore}%` : 'None'}
            </div>
          </div>
        </div>

        {/* Assessment Instructions */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>
            Assessment Rules & Instructions
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              color: 'var(--text-muted)',
              fontSize: '0.925rem',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Authoritative Server Timer:</strong> Once started, the timer will countdown continuously. If time runs out, your current answers are automatically submitted.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Continuous Answer Saving:</strong> Every response you choose or type is automatically saved to the server. You can freely navigate between questions.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Instant Grading & Review:</strong> Immediate server-side evaluation upon submission, detailing your percentage score and explanations.
              </span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={handleStartAttempt}
            disabled={starting}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '220px' }}
          >
            {starting ? 'Initializing Attempt...' : (
              <>
                <Play size={18} fill="currentColor" /> Begin Assessment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
