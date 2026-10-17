import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const isLowTime = secondsLeft < 60 && secondsLeft > 0;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        background: isLowTime ? 'rgba(244, 63, 94, 0.15)' : 'rgba(17, 24, 39, 0.9)',
        border: `1px solid ${isLowTime ? '#f43f5e' : 'var(--border-subtle)'}`,
        color: isLowTime ? '#fb7185' : '#ffffff',
        fontWeight: 700,
        fontSize: '1.05rem',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.04em',
        transition: 'all 0.3s ease',
      }}
      className={isLowTime ? 'pulse-warning' : ''}
    >
      {isLowTime ? (
        <AlertTriangle size={18} color="#f43f5e" />
      ) : (
        <Clock size={18} color="#6366f1" />
      )}
      <span>
        {String(minutes).padStart(2, '0')}:{String(remainingSecs).padStart(2, '0')}
      </span>
      {isLowTime && (
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#f43f5e' }}>
          Low Time!
        </span>
      )}
    </div>
  );
};
