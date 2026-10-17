import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Check,
  X,
  Info,
} from 'lucide-react';

export const QuizResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      if (!attemptId) return;
      setLoading(true);
      const res = await api.getResult(attemptId);
      if (res.success && res.data?.result) {
        setResult(res.data.result);

        // Fire celebration confetti if passed
        if (res.data.result.passed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        setError(res.message || 'Result could not be loaded.');
      }
      setLoading(false);
    }

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Calculating authoritative evaluation results...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
          <h2>Result Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'Unable to retrieve attempt results.'}</p>
          <Link to="/quizzes" className="btn btn-secondary">
            Return to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const durationMin = result.durationTakenSeconds ? Math.floor(result.durationTakenSeconds / 60) : 0;
  const durationSec = result.durationTakenSeconds ? result.durationTakenSeconds % 60 : 0;

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
      {/* Result Hero Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: result.passed
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(17, 24, 39, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(17, 24, 39, 0.9) 100%)',
          border: `1px solid ${result.passed ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
        }}
      >
        <span className="badge badge-topic" style={{ marginBottom: '0.75rem' }}>
          {result.quizTopic}
        </span>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>
          {result.quizTitle}
        </h1>

        <div style={{ margin: '1.5rem 0' }}>
          <div
            style={{
              fontSize: '3.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: result.passed ? '#34d399' : '#fb7185',
              lineHeight: 1,
            }}
          >
            {result.percentage}%
          </div>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Score: <strong style={{ color: '#fff' }}>{result.score}</strong> / {result.totalMarks} Marks
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span
            className={`badge ${result.passed ? 'badge-pass' : 'badge-fail'}`}
            style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}
          >
            {result.passed ? 'PASSED' : result.passed === false ? 'FAILED' : 'EVALUATED'}
          </span>
          {result.passingScore && (
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
              Pass threshold: {result.passingScore}%
            </span>
          )}
        </div>

        {/* Sub metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '0.75rem',
            maxWidth: '650px',
            margin: '0 auto',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>CORRECT</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={16} /> {result.correctCount}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>INCORRECT</div>
            <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <XCircle size={16} /> {result.incorrectCount}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>UNANSWERED</div>
            <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <HelpCircle size={16} /> {result.unansweredCount}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>TIME TAKEN</div>
            <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <Clock size={16} /> {durationMin}m {durationSec}s
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <Link to="/quizzes" className="btn btn-secondary">
          <BookOpen size={16} /> Take Another Quiz
        </Link>
        <Link to="/student/attempts" className="btn btn-primary">
          View All Attempts <ArrowRight size={16} />
        </Link>
      </div>

      {/* Question-by-Question Review */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Question-by-Question Review</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {result.reviewQuestions?.map((q: any, index: number) => {
            const isCorrect = q.studentAnswer.isCorrect;
            const isUnanswered = q.studentAnswer.isUnanswered;

            let statusBorder = isCorrect
              ? 'rgba(16, 185, 129, 0.4)'
              : isUnanswered
              ? 'rgba(156, 163, 175, 0.3)'
              : 'rgba(244, 63, 94, 0.4)';

            return (
              <div
                key={q.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${isCorrect ? '#10b981' : isUnanswered ? '#6b7280' : '#f43f5e'}`,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                      Q{index + 1}.
                    </span>
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                      {q.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: isCorrect ? '#34d399' : '#fb7185',
                      }}
                    >
                      {q.studentAnswer.marksAwarded} / {q.marks} Marks
                    </span>
                    <span
                      className={`badge ${isCorrect ? 'badge-pass' : isUnanswered ? 'badge-draft' : 'badge-fail'}`}
                    >
                      {isCorrect ? 'CORRECT' : isUnanswered ? 'UNANSWERED' : 'INCORRECT'}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.4 }}>
                  {q.text}
                </div>

                {/* If MCQ: Options list */}
                {q.type === 'MCQ' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {q.options?.map((opt: any) => {
                      const isStudentChoice = q.studentAnswer.selectedOptionId === opt.id;
                      const isCorrectChoice = opt.isCorrect;

                      let optBg = 'rgba(255, 255, 255, 0.02)';
                      let optBorder = '1px solid var(--border-subtle)';
                      let optColor = 'var(--text-muted)';

                      if (isCorrectChoice) {
                        optBg = 'rgba(16, 185, 129, 0.15)';
                        optBorder = '1px solid rgba(16, 185, 129, 0.4)';
                        optColor = '#34d399';
                      } else if (isStudentChoice && !isCorrectChoice) {
                        optBg = 'rgba(244, 63, 94, 0.15)';
                        optBorder = '1px solid rgba(244, 63, 94, 0.4)';
                        optColor = '#fb7185';
                      }

                      return (
                        <div
                          key={opt.id}
                          style={{
                            padding: '0.65rem 1rem',
                            borderRadius: '0.5rem',
                            background: optBg,
                            border: optBorder,
                            color: optColor,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{opt.text}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {isStudentChoice && (
                              <span style={{ color: isCorrectChoice ? '#34d399' : '#fb7185' }}>
                                (Your Answer)
                              </span>
                            )}
                            {isCorrectChoice && (
                              <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Check size={14} /> Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Short Answer breakdown */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Your Answer: </span>
                      <strong style={{ color: isCorrect ? '#34d399' : '#fb7185' }}>
                        {q.studentAnswer.textAnswer || '(No answer provided)'}
                      </strong>
                    </div>
                    <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Accepted Answer: </span>
                      <strong style={{ color: '#34d399' }}>{q.correctAnswerText}</strong>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      gap: '0.5rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <Info size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#a5b4fc' }}>Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
