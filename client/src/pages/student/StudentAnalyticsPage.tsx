import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Layers,
  BarChart2,
  Calendar,
} from 'lucide-react';

export const StudentAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const res = await api.getStudentOverview();
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating student performance analytics...
      </div>
    );
  }

  const { totalAttempts, completedQuizzes, averageScorePercentage, passRatePercentage, trend, topicWise } =
    data || {};

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Performance Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Evaluate score progression over time, accuracy rate, and topic-wise mastery
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          icon={<CheckCircle size={22} />}
          label="COMPLETED QUIZZES"
          value={completedQuizzes ?? 0}
          color="#10b981"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="AVERAGE SCORE"
          value={`${averageScorePercentage ?? 0}%`}
          color="#6366f1"
        />
        <StatCard
          icon={<Award size={22} />}
          label="PASS RATE"
          value={`${passRatePercentage ?? 0}%`}
          color="#06b6d4"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="ASSESSMENT SESSIONS"
          value={totalAttempts ?? 0}
          color="#8b5cf6"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Trend Over Time Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart2 size={20} color="#6366f1" />
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Score Trend Over Time</h2>
          </div>

          {!trend || trend.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>
              No assessment trend data available yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {trend.map((item: any, idx: number) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>
                      #{item.attemptNumber} · {item.quizTitle}
                    </span>
                    <span style={{ color: item.percentage >= 60 ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                      {item.percentage}% ({item.score}/{item.totalMarks} marks)
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div
                    style={{
                      height: '10px',
                      borderRadius: '5px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background:
                          item.percentage >= 70
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : item.percentage >= 50
                            ? 'linear-gradient(90deg, #6366f1, #06b6d4)'
                            : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                        borderRadius: '5px',
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic-wise Mastery Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Layers size={20} color="#06b6d4" />
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Topic-Wise Mastery</h2>
          </div>

          {!topicWise || topicWise.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>
              No topic mastery data available.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {topicWise.map((item: any, idx: number) => {
                const isProficient = item.averagePercentage >= 75;

                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{item.topic}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
                          ({item.attemptsCount} {item.attemptsCount === 1 ? 'quiz' : 'quizzes'})
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isProficient ? '#34d399' : '#a5b4fc',
                        }}
                      >
                        {item.averagePercentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        height: '12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${item.averagePercentage}%`,
                          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                          borderRadius: '6px',
                          transition: 'width 0.5s ease-out',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
