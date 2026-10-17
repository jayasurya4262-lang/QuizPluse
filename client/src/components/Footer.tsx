import React from 'react';
import { Sparkles, ShieldCheck, Database, Server, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 25, 0.95)',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '350px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <img
                src="/assets/logo.jpg"
                alt="QuizPulse"
                style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }}
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                QuizPulse
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Production-grade assessment and online quiz platform built directly to Jira TRIAL Epic specifications.
              Fully integrated with React, Express, and Neon PostgreSQL.
            </p>
          </div>

          {/* Architecture & Jira Epics Mapping */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              JIRA PROJECT IMPLEMENTATION
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: '400px' }}>
              <span className="badge badge-topic">TRIAL-10: Auth & Users</span>
              <span className="badge badge-topic">TRIAL-11: Quiz Management</span>
              <span className="badge badge-topic">TRIAL-12: Quiz Engine</span>
              <span className="badge badge-topic">TRIAL-13: Scoring & Eval</span>
              <span className="badge badge-topic">TRIAL-14: Student Analytics</span>
              <span className="badge badge-topic">TRIAL-15: Teacher Analytics</span>
            </div>
          </div>

          {/* Infrastructure Specs */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem' }}>
              SYSTEM ARCHITECTURE
            </h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={14} color="#38bdf8" /> Frontend: React 18 + Vite (Vercel Ready)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Server size={14} color="#a855f7" /> Backend: Express + TypeScript (Render Ready)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={14} color="#10b981" /> Database: Neon Serverless PostgreSQL
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#6366f1" /> RBAC & Cryptographic Sessions
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <p>© {new Date().getFullYear()} QuizPulse Assessment Engine. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Neon PostgreSQL Connected
            </span>
            <span>Jira Key: TRIAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
