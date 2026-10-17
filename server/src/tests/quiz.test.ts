import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Quiz & Question Lifecycle API (TRIAL-21, TRIAL-22, TRIAL-24, TRIAL-26, TRIAL-27)', () => {
  let teacherToken: string;
  let createdQuizId: string;

  it('authenticates seed teacher', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teacher@quizpulse.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('TEACHER');
    teacherToken = res.body.data.token;
  });

  it('allows teacher to create a DRAFT quiz', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'CI/CD Pipeline Fundamentals',
        description: 'Automated test suite quiz',
        topic: 'DevOps',
        durationMinutes: 10,
        passingScore: 60,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.quiz.status).toBe('DRAFT');
    createdQuizId = res.body.data.quiz.id;
  });

  it('rejects publishing a quiz with no questions (TRIAL-26 validation)', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${createdQuizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some((e: string) => e.includes('at least 1 question'))).toBe(true);
  });

  it('adds questions with marks and validates total marks (TRIAL-22, TRIAL-24)', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${createdQuizId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        type: 'MCQ',
        text: 'What does CI stand for in modern software engineering?',
        marks: 5,
        explanation: 'Continuous Integration',
        options: [
          { text: 'Continuous Integration', isCorrect: true },
          { text: 'Code Inspection', isCorrect: false },
          { text: 'Central Interface', isCorrect: false },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.question.marks).toBe(5);
  });

  it('successfully publishes quiz once questions are valid (TRIAL-26)', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${createdQuizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quiz.status).toBe('PUBLISHED');
  });

  it('does NOT leak isCorrect or explanation in public student view (TRIAL-27)', async () => {
    const res = await request(app).get(`/api/quizzes/${createdQuizId}`);

    expect(res.status).toBe(200);
    const quiz = res.body.data.quiz;
    expect(quiz.status).toBe('PUBLISHED');
    expect(quiz.questions.length).toBe(1);

    const question = quiz.questions[0];
    expect(question.explanation).toBeUndefined();
    for (const opt of question.options) {
      expect(opt.isCorrect).toBeUndefined();
    }
  });
});
