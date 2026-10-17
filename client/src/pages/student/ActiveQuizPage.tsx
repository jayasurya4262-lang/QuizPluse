import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Timer } from '../../components/Timer';
import { QuestionPalette } from '../../components/QuestionPalette';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Send,
  AlertCircle,
  HelpCircle,
  Check,
  Save,
} from 'lucide-react';

export const ActiveQuizPage: React.FC = () => {
  const { quizId, attemptId } = useParams<{ quizId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, { selectedOptionId?: string; textAnswer?: string }>>(new Map());
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<string>('Saved');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoSaveTimeout = useRef<any>(null);

  // Load Attempt State
  useEffect(() => {
    async function fetchAttempt() {
      if (!attemptId) return;
      setLoading(true);
      const res = await api.getAttempt(attemptId);
      if (res.success && res.data) {
        const { attempt: att, questions: qs } = res.data;
        if (att.status === 'SUBMITTED' || att.status === 'EXPIRED') {
          // Already submitted, redirect to result
          navigate(`/results/${att.id}`, { replace: true });
          return;
        }

        setAttempt(att);
        setQuestions(qs);

        // Prepopulate answers
        const ansMap = new Map();
        if (att.answers) {
          att.answers.forEach((a: any) => {
            ansMap.set(a.questionId, {
              selectedOptionId: a.selectedOptionId,
              textAnswer: a.textAnswer,
            });
          });
        }
        setAnswers(ansMap);
      } else {
        setError(res.message || 'Error loading active attempt');
      }
      setLoading(false);
    }

    fetchAttempt();
  }, [attemptId, navigate]);

  // Save answer to server
  const saveAnswerToServer = useCallback(
    async (questionId: string, answerData: { selectedOptionId?: string; textAnswer?: string }) => {
      if (!attemptId) return;
      setSavingStatus('Saving...');
      const res = await api.saveAnswer(attemptId, {
        questionId,
        selectedOptionId: answerData.selectedOptionId || null,
        textAnswer: answerData.textAnswer || null,
      });

      if (res.success) {
        setSavingStatus('Saved');
      } else {
        setSavingStatus('Save failed');
      }
    },
    [attemptId]
  );

  // Handle MCQ selection
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    const updated = { selectedOptionId: optionId, textAnswer: undefined };
    newAnswers.set(currentQuestion.id, updated);
    setAnswers(newAnswers);

    saveAnswerToServer(currentQuestion.id, updated);
  };

  // Handle Short Answer input
  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    const updated = { textAnswer: text, selectedOptionId: undefined };
    newAnswers.set(currentQuestion.id, updated);
    setAnswers(newAnswers);

    // Debounce save to server
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      saveAnswerToServer(currentQuestion.id, updated);
    }, 400);
  };

  // Toggle flag for question
  const toggleFlag = () => {
    const nextFlagged = new Set(flaggedIndices);
    if (nextFlagged.has(currentIndex)) {
      nextFlagged.delete(currentIndex);
    } else {
      nextFlagged.add(currentIndex);
    }
    setFlaggedIndices(nextFlagged);
  };

  // Submit attempt
  const handleSubmitQuiz = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    setIsSubmitModalOpen(false);

    const res = await api.submitAttempt(attemptId);
    setSubmitting(false);

    if (res.success && res.data?.attempt) {
      navigate(`/results/${attemptId}`, { replace: true });
    } else {
      alert(res.message || 'Error submitting quiz.');
    }
  };

  // Auto-submit on timer expiry
  const handleTimeUp = useCallback(() => {
    if (!submitting) {
      handleSubmitQuiz();
    }
  }, [submitting, attemptId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Preparing assessment environment...
      </div>
    );
  }

  if (error || !attempt || questions.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
          <AlertCircle size={36} color="#f43f5e" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Unable to Resume Attempt</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'Attempt session invalid.'}</p>
          <button onClick={() => navigate('/quizzes')} className="btn btn-secondary">
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion?.id);

  // Calculate answered indices
  const answeredIndices = new Set<number>();
  questions.forEach((q, idx) => {
    const ans = answers.get(q.id);
    if (ans && (ans.selectedOptionId || (ans.textAnswer && ans.textAnswer.trim().length > 0))) {
      answeredIndices.add(idx);
    }
  });

  const totalAnswered = answeredIndices.size;
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - totalAnswered;

  return (
    <div style={{ padding: '1.5rem 0', minHeight: 'calc(100vh - 4.25rem)' }}>
      <div className="container">
        {/* Active Quiz Header Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ASSESSMENT IN PROGRESS
            </span>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
              {attempt.quizTitle}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Auto-save status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: savingStatus === 'Saved' ? '#10b981' : '#f59e0b' }}>
              <Save size={13} /> {savingStatus}
            </div>

            {/* Authoritative Timer */}
            <Timer initialSeconds={attempt.remainingSeconds} onTimeUp={handleTimeUp} />

            {/* Finish & Submit Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.15rem' }}
            >
              <Send size={15} /> Submit Quiz
            </button>
          </div>
        </div>

        {/* Main Content Layout: Question Area (left) + Question Palette (right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 280px',
            gap: '1.5rem',
            alignItems: 'start',
          }}
          className="quiz-layout-grid"
        >
          {/* Question Card & Interactions */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {/* Question Header Meta */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '0.375rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="badge badge-topic">
                  {currentQuestion.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                </span>
                <button
                  onClick={toggleFlag}
                  style={{
                    background: flaggedIndices.has(currentIndex) ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.375rem',
                    padding: '0.35rem 0.65rem',
                    color: flaggedIndices.has(currentIndex) ? '#f59e0b' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <Bookmark size={14} /> {flaggedIndices.has(currentIndex) ? 'Flagged' : 'Flag'}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.5, marginBottom: '2rem' }}>
              {currentQuestion.text}
            </div>

            {/* Answer Interface */}
            {currentQuestion.type === 'MCQ' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
                {currentQuestion.options?.map((opt: any, optIdx: number) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = currentAnswer?.selectedOptionId === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '0.75rem',
                        background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${isSelected ? '#6366f1' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected ? <Check size={16} /> : letter}
                      </div>
                      <div style={{ fontSize: '1rem', color: isSelected ? '#ffffff' : 'var(--text-muted)' }}>
                        {opt.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginBottom: '2.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.6rem' }}>
                  Your Response (Short Answer):
                </label>
                <input
                  type="text"
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="form-input"
                  style={{ padding: '0.85rem 1.15rem', fontSize: '1.05rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem', display: 'block' }}>
                  Auto-saved upon typing. Matching is case-insensitive.
                </span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.5rem',
              }}
            >
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn btn-secondary"
                style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
              >
                <ArrowLeft size={16} /> Previous Question
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="btn btn-primary"
                >
                  Next Question <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="btn btn-success"
                >
                  <Send size={16} /> Review & Submit
                </button>
              )}
            </div>
          </div>

          {/* Right Palette Column */}
          <div>
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
              answeredIndices={answeredIndices}
              flaggedIndices={flaggedIndices}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Submission Modal */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        title="Confirm Assessment Submission"
        message={
          <div>
            <p style={{ marginBottom: '1rem' }}>
              Are you sure you want to finish and submit your quiz now?
            </p>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Answered Questions:</span>
                <strong style={{ color: '#10b981' }}>{totalAnswered} / {totalQuestions}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Unanswered Questions:</span>
                <strong style={{ color: unansweredCount > 0 ? '#f43f5e' : '#9ca3af' }}>
                  {unansweredCount}
                </strong>
              </div>
            </div>
            {unansweredCount > 0 && (
              <p style={{ color: '#fb7185', fontSize: '0.85rem' }}>
                ⚠️ You have {unansweredCount} unanswered questions. Unanswered questions will receive 0 marks.
              </p>
            )}
          </div>
        }
        confirmLabel={submitting ? 'Evaluating...' : 'Submit Assessment'}
        cancelLabel="Keep Working"
        onConfirm={handleSubmitQuiz}
        onCancel={() => setIsSubmitModalOpen(false)}
      />

      <style>{`
        @media (max-width: 900px) {
          .quiz-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
