import React from 'react';
import { Bookmark, Check } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  answeredIndices: Set<number>;
  flaggedIndices: Set<number>;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  onSelectIndex,
  answeredIndices,
  flaggedIndices,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Question Palette</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {answeredIndices.size} / {totalQuestions} Answered
        </span>
      </h3>

      {/* Grid of question buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isCurrent = currentIndex === index;
          const isAnswered = answeredIndices.has(index);
          const isFlagged = flaggedIndices.has(index);

          let bg = 'rgba(255, 255, 255, 0.05)';
          let border = '1px solid var(--border-subtle)';
          let color = 'var(--text-muted)';

          if (isAnswered) {
            bg = 'rgba(16, 185, 129, 0.2)';
            border = '1px solid rgba(16, 185, 129, 0.5)';
            color = '#34d399';
          }

          if (isCurrent) {
            border = '2px solid #6366f1';
            color = '#ffffff';
            bg = isAnswered ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.25)';
          }

          return (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: bg,
                border,
                borderRadius: '0.5rem',
                color,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={`Question ${index + 1}`}
            >
              {index + 1}

              {isFlagged && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                  }}
                />
              )}

              {isAnswered && (
                <Check
                  size={10}
                  style={{ position: 'absolute', bottom: '3px', right: '3px', color: '#10b981' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10b981' }} />
          <span>Answered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #6366f1', background: 'rgba(99, 102, 241, 0.25)' }} />
          <span>Current Question</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)' }} />
          <span>Unanswered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          <span>Flagged for Review</span>
        </div>
      </div>
    </div>
  );
};
