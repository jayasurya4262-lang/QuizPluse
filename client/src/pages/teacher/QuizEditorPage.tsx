import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Eye,
  Settings,
  ListOrdered,
} from 'lucide-react';

export const QuizEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'preview'>('settings');

  // Quiz Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Computer Science');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState<number>(60);
  const [status, setStatus] = useState<string>('DRAFT');
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Questions State
  const [questions, setQuestions] = useState<any[]>([]);

  // Question Form Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qType, setQType] = useState<'MCQ' | 'SHORT_ANSWER'>('MCQ');
  const [qText, setQText] = useState('');
  const [qMarks, setQMarks] = useState(2);
  const [qExplanation, setQExplanation] = useState('');
  const [qExpectedAnswer, setQExpectedAnswer] = useState('');
  const [qOptions, setQOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Publish validation state
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Load existing quiz if editing
  useEffect(() => {
    async function loadQuiz() {
      if (!id) return;
      const res = await api.getQuiz(id);
      if (res.success && res.data?.quiz) {
        const q = res.data.quiz;
        setTitle(q.title);
        setDescription(q.description || '');
        setTopic(q.topic);
        setDurationMinutes(q.durationMinutes);
        setPassingScore(q.passingScore ?? 60);
        setStatus(q.status);
        setQuestions(q.questions || []);
      }
    }
    loadQuiz();
  }, [id]);

  // Save Quiz Metadata (TRIAL-21, TRIAL-25)
  const handleSaveQuizMetadata = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingQuiz(true);
    setPublishErrors(null);

    const payload = {
      title,
      description,
      topic,
      durationMinutes: Number(durationMinutes),
      passingScore: passingScore ? Number(passingScore) : null,
    };

    let res;
    if (isNew) {
      res = await api.createQuiz(payload);
      setSavingQuiz(false);
      if (res.success && res.data?.quiz) {
        navigate(`/teacher/quizzes/${res.data.quiz.id}/edit`, { replace: true });
      } else {
        alert(res.message || 'Failed to create quiz');
      }
    } else {
      res = await api.updateQuiz(id, payload);
      setSavingQuiz(false);
      if (res.success) {
        alert('Quiz settings saved successfully!');
      } else {
        alert(res.message || 'Failed to update quiz settings');
      }
    }
  };

  // Open modal to add new question
  const openAddQuestion = () => {
    setEditingQuestionId(null);
    setQType('MCQ');
    setQText('');
    setQMarks(2);
    setQExplanation('');
    setQExpectedAnswer('');
    setQOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setQuestionError(null);
    setIsQuestionModalOpen(true);
  };

  // Open modal to edit question
  const openEditQuestion = (question: any) => {
    setEditingQuestionId(question.id);
    setQType(question.type);
    setQText(question.text);
    setQMarks(question.marks);
    setQExplanation(question.explanation || '');
    setQExpectedAnswer(question.expectedAnswer || '');
    if (question.type === 'MCQ' && question.options) {
      setQOptions(
        question.options.map((opt: any) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        }))
      );
    } else {
      setQOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ]);
    }
    setQuestionError(null);
    setIsQuestionModalOpen(true);
  };

  // Save question (TRIAL-22, TRIAL-23, TRIAL-24)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError(null);

    if (!qText.trim()) {
      setQuestionError('Question text cannot be blank');
      return;
    }
    if (qMarks <= 0) {
      setQuestionError('Question marks must be at least 1');
      return;
    }

    if (qType === 'MCQ') {
      const validOpts = qOptions.filter((o) => o.text.trim().length > 0);
      if (validOpts.length < 2) {
        setQuestionError('MCQ question requires at least 2 non-empty options');
        return;
      }
      const correctCount = validOpts.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        setQuestionError('Please designate exactly one option as the correct answer key');
        return;
      }
    } else if (qType === 'SHORT_ANSWER') {
      if (!qExpectedAnswer.trim()) {
        setQuestionError('Short answer question requires an expected answer key');
        return;
      }
    }

    const payload: any = {
      type: qType,
      text: qText.trim(),
      marks: Number(qMarks),
      explanation: qExplanation.trim() || null,
      expectedAnswer: qType === 'SHORT_ANSWER' ? qExpectedAnswer.trim() : null,
      options: qType === 'MCQ' ? qOptions.filter((o) => o.text.trim().length > 0) : undefined,
    };

    if (editingQuestionId) {
      const res = await api.updateQuestion(id!, editingQuestionId, payload);
      if (res.success && res.data?.question) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingQuestionId ? res.data.question : q))
        );
        setIsQuestionModalOpen(false);
      } else {
        setQuestionError(res.message || 'Error updating question');
      }
    } else {
      const res = await api.addQuestion(id!, payload);
      if (res.success && res.data?.question) {
        setQuestions((prev) => [...prev, res.data.question]);
        setIsQuestionModalOpen(false);
      } else {
        setQuestionError(res.message || 'Error adding question');
      }
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const res = await api.deleteQuestion(id!, questionId);
    if (res.success) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } else {
      alert(res.message || 'Failed to delete question');
    }
  };

  // Reorder questions
  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setQuestions(reordered);

    await api.reorderQuestions(id!, reordered.map((q) => q.id));
  };

  // Publish Quiz (TRIAL-26)
  const handlePublishQuiz = async () => {
    setPublishErrors(null);
    setPublishSuccess(null);
    const res = await api.publishQuiz(id!);
    if (res.success) {
      setStatus('PUBLISHED');
      setPublishSuccess('Quiz successfully published! Eligible students can now attend this assessment.');
    } else {
      const errList = Array.isArray(res.errors)
        ? res.errors.map((e: any) => (typeof e === 'string' ? e : e.message || JSON.stringify(e)))
        : [res.message || 'Publishing validation failed.'];
      setPublishErrors(errList);
    }
  };

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '950px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link
          to="/teacher/quizzes"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to My Quizzes
        </Link>

        {!isNew && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge ${status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
              Status: {status}
            </span>
            {status !== 'PUBLISHED' && (
              <button onClick={handlePublishQuiz} className="btn btn-success btn-sm">
                <UploadCloud size={14} /> Validate & Publish
              </button>
            )}
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {publishSuccess && (
        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', marginBottom: '1.5rem' }}>
          <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {publishSuccess}
        </div>
      )}

      {publishErrors && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid #f43f5e', marginBottom: '1.5rem' }}>
          <div style={{ color: '#fb7185', fontWeight: 700, marginBottom: '0.4rem' }}>
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
            Publishing Requirement Violations:
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#fca5a5', fontSize: '0.875rem' }}>
            {publishErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Editor Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.5rem',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => setActiveTab('settings')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'settings' ? '#6366f1' : 'transparent',
            color: activeTab === 'settings' ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Settings size={14} /> 1. Quiz Settings & Duration
        </button>
        {!isNew && (
          <>
            <button
              onClick={() => setActiveTab('questions')}
              className="btn btn-sm"
              style={{
                background: activeTab === 'questions' ? '#6366f1' : 'transparent',
                color: activeTab === 'questions' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <ListOrdered size={14} /> 2. Questions ({questions.length}) · {totalCalculatedMarks} Marks
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className="btn btn-sm"
              style={{
                background: activeTab === 'preview' ? '#6366f1' : 'transparent',
                color: activeTab === 'preview' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Eye size={14} /> 3. Student Preview
            </button>
          </>
        )}
      </div>

      {/* TAB 1: Quiz Settings */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            {isNew ? 'Create New Assessment' : 'Edit Quiz Settings'}
          </h2>

          <form onSubmit={handleSaveQuizMetadata}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Quiz Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
                placeholder="e.g. Modern Full-Stack Web Architecture"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="topic">
                Topic / Category *
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="form-input"
                placeholder="e.g. Computer Science, Science, DevOps, Mathematics"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description / Instructions
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Provide student instructions and assessment objectives..."
              />
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" htmlFor="duration">
                  Duration (Minutes) * (TRIAL-25)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  required
                  min={1}
                  max={180}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="passing">
                  Passing Score Percentage (%)
                </label>
                <input
                  id="passing"
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="form-input"
                  placeholder="e.g. 60"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="submit" disabled={savingQuiz} className="btn btn-primary">
                <Save size={16} /> {isNew ? 'Create & Proceed to Questions' : 'Save Quiz Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Question Management */}
      {activeTab === 'questions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Question Builder</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Total Marks: <strong style={{ color: '#34d399' }}>{totalCalculatedMarks}</strong> · {questions.length} Questions
              </p>
            </div>

            <button onClick={openAddQuestion} className="btn btn-primary">
              <PlusCircle size={16} /> Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <HelpCircle size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
              <h3>No Questions Added Yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
                Add multiple-choice or short-answer questions with assigned marks.
              </p>
              <button onClick={openAddQuestion} className="btn btn-primary">
                <PlusCircle size={16} /> Add First Question
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map((q, idx) => (
                <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#6366f1' }}>#{idx + 1}</span>
                      <span className="badge badge-topic">{q.type === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}</span>
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                        {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleMoveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="btn btn-secondary btn-sm"
                        title="Move Up"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(idx, 'down')}
                        disabled={idx === questions.length - 1}
                        className="btn btn-secondary btn-sm"
                        title="Move Down"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        onClick={() => openEditQuestion(q)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600, marginBottom: '0.85rem' }}>
                    {q.text}
                  </div>

                  {q.type === 'MCQ' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {q.options.map((opt: any) => (
                        <div
                          key={opt.id || opt.text}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            background: opt.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${opt.isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                            color: opt.isCorrect ? '#34d399' : 'var(--text-muted)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{opt.text}</span>
                          {opt.isCorrect && <strong style={{ color: '#34d399' }}>✓ Correct Key</strong>}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'SHORT_ANSWER' && (
                    <div style={{ fontSize: '0.85rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                      Expected Answer: <strong>{q.expectedAnswer}</strong>
                    </div>
                  )}

                  {q.explanation && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                      Explanation: {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Student Preview */}
      {activeTab === 'preview' && (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-draft" style={{ marginBottom: '0.5rem' }}>
              SIMULATED STUDENT PREVIEW
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>{title}</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {durationMinutes} Minutes Duration · {questions.length} Questions · {totalCalculatedMarks} Total Marks
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#6366f1' }}>Question {idx + 1}</span>
                  <span style={{ color: '#34d399', fontSize: '0.85rem' }}>{q.marks} Marks</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                  {q.text}
                </div>

                {q.type === 'MCQ' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options?.map((opt: any) => (
                      <div
                        key={opt.id || opt.text}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {opt.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    disabled
                    placeholder="Student types short answer response here..."
                    className="form-input"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {isQuestionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#111827',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
              {editingQuestionId ? 'Edit Question' : 'Add Question to Quiz'}
            </h3>

            {questionError && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', color: '#fb7185', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <AlertTriangle size={15} style={{ display: 'inline', marginRight: '0.3rem' }} />
                {questionError}
              </div>
            )}

            <form onSubmit={handleSaveQuestion}>
              <div className="grid-cols-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Question Type</label>
                  <select
                    value={qType}
                    onChange={(e: any) => setQType(e.target.value)}
                    className="form-select"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Marks (Points) * (TRIAL-24)</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    min={1}
                    max={50}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  rows={3}
                  required
                  placeholder="Enter the question prompt..."
                  className="form-textarea"
                />
              </div>

              {/* If MCQ: Options Builder */}
              {qType === 'MCQ' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Answer Options (Select the correct answer key) *</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Radio button selects correct answer</span>
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {qOptions.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => {
                            const updated = qOptions.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            }));
                            setQOptions(updated);
                          }}
                          style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                          title="Designate as correct answer"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...qOptions];
                            updated[idx].text = e.target.value;
                            setQOptions(updated);
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="form-input"
                          style={{
                            borderColor: opt.isCorrect ? '#10b981' : undefined,
                            background: opt.isCorrect ? 'rgba(16, 185, 129, 0.05)' : undefined,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If SHORT_ANSWER */}
              {qType === 'SHORT_ANSWER' && (
                <div className="form-group">
                  <label className="form-label">Expected Answer Key *</label>
                  <input
                    type="text"
                    value={qExpectedAnswer}
                    onChange={(e) => setQExpectedAnswer(e.target.value)}
                    required
                    placeholder="e.g. Paris (or semicolon separated synonyms: Paris;paris)"
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
                    Evaluation matches case-insensitively and trims whitespace. Separate multiple acceptable synonyms with semicolons.
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Explanation (Revealed in student review mode)</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  rows={2}
                  placeholder="Explain why this answer is correct..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
