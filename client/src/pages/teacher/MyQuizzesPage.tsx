import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  PlusCircle,
  Edit,
  Trash2,
  BarChart2,
  CheckCircle,
  Clock,
  Award,
  AlertTriangle,
  UploadCloud,
  FileQuestion,
} from 'lucide-react';

export const MyQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Deletion modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Publish error state
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null);

  const fetchMyQuizzes = async () => {
    setLoading(true);
    const res = await api.getQuizzes({
      myQuizzes: true,
      status: filterStatus === 'all' ? undefined : filterStatus,
    });
    if (res.success && res.data?.quizzes) {
      setQuizzes(res.data.quizzes);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, [filterStatus]);

  const handleTogglePublish = async (quiz: any) => {
    setPublishErrors(null);
    if (quiz.status === 'PUBLISHED') {
      const res = await api.unpublishQuiz(quiz.id);
      if (res.success) {
        fetchMyQuizzes();
      } else {
        alert(res.message || 'Failed to unpublish quiz');
      }
    } else {
      const res = await api.publishQuiz(quiz.id);
      if (res.success) {
        fetchMyQuizzes();
      } else {
        const errList = Array.isArray(res.errors)
          ? res.errors.map((e: any) => (typeof e === 'string' ? e : e.message || JSON.stringify(e)))
          : [res.message || 'Publishing validation failed'];
        setPublishErrors(errList);
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await api.deleteQuiz(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (res.success) {
      fetchMyQuizzes();
    } else {
      alert(res.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>My Quizzes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Design questions, set marks, publish assessments, and evaluate student submissions
          </p>
        </div>

        <Link to="/teacher/quizzes/create" className="btn btn-primary">
          <PlusCircle size={18} /> Create New Quiz
        </Link>
      </div>

      {/* Validation Error Alert Banner if Publish failed */}
      {publishErrors && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            marginBottom: '1.75rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontWeight: 700, marginBottom: '0.5rem' }}>
            <AlertTriangle size={18} /> Cannot Publish Quiz — Requirement Checks Failed:
          </div>
          <ul style={{ paddingLeft: '1.5rem', color: '#fca5a5', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {publishErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        {['all', 'PUBLISHED', 'DRAFT'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="btn btn-sm"
            style={{
              background: filterStatus === s ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
              color: filterStatus === s ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {s === 'all' ? 'All Quizzes' : s === 'PUBLISHED' ? 'Published' : 'Drafts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <FileQuestion size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Quizzes Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.5rem 0' }}>
            Create your first quiz to begin designing questions and assessing students.
          </p>
          <Link to="/teacher/quizzes/create" className="btn btn-primary">
            <PlusCircle size={16} /> Create Quiz
          </Link>
        </div>
      ) : (
        <div className="grid-cols-2">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-topic">{quiz.topic}</span>
                  <span className={`badge ${quiz.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
                    {quiz.status}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {quiz.title}
                </h2>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {quiz.description || 'No description provided.'}
                </p>

                {/* Specs */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.825rem',
                    color: 'var(--text-dim)',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {quiz.durationMinutes} mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileQuestion size={13} /> {quiz.questionCount} Questions
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={13} /> {quiz.totalMarks} Total Marks
                  </span>
                  <span>{quiz.attemptCount} Student Attempts</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <Link
                  to={`/teacher/quizzes/${quiz.id}/edit`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Edit size={14} /> Edit & Questions
                </Link>

                <button
                  onClick={() => handleTogglePublish(quiz)}
                  className={`btn btn-sm ${quiz.status === 'PUBLISHED' ? 'btn-secondary' : 'btn-success'}`}
                  style={{ justifyContent: 'center' }}
                >
                  <UploadCloud size={14} /> {quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>

                <Link
                  to={`/teacher/quizzes/${quiz.id}/results`}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}
                  title="View Student Results & Analytics"
                >
                  <BarChart2 size={14} /> Results ({quiz.attemptCount})
                </Link>

                <button
                  onClick={() => setDeleteId(quiz.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete Quiz"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Assessment Quiz?"
        message="Are you sure you want to permanently delete this quiz? All associated questions, student attempts, and stored marks will be completely removed."
        confirmLabel={deleting ? 'Deleting...' : 'Delete Permanently'}
        cancelLabel="Cancel"
        isDanger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
