import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Authentication & RBAC API (TRIAL-1, TRIAL-16, TRIAL-17, TRIAL-18, TRIAL-20)', () => {
  const timestamp = Date.now();
  const testStudentEmail = `test_student_${timestamp}@test.com`;
  const testTeacherEmail = `test_teacher_${timestamp}@test.com`;

  it('registers a student with STUDENT role', async () => {
    const res = await request(app)
      .post('/api/auth/register-student')
      .send({
        name: 'Test Student',
        email: testStudentEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.token).toBeDefined();
  });

  it('registers a teacher with TEACHER role', async () => {
    const res = await request(app)
      .post('/api/auth/register-teacher')
      .send({
        name: 'Test Teacher',
        email: testTeacherEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('TEACHER');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register-student')
      .send({
        name: 'Duplicate Student',
        email: testStudentEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('authenticates valid credentials and rejects invalid password', async () => {
    // Valid login
    const validRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudentEmail,
        password: 'Password123!',
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.token).toBeDefined();

    // Invalid password
    const invalidRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudentEmail,
        password: 'WrongPassword!',
      });

    expect(invalidRes.status).toBe(401);
    expect(invalidRes.body.success).toBe(false);
  });

  it('enforces RBAC: prevents student from creating a quiz', async () => {
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudentEmail,
        password: 'Password123!',
      });

    const studentToken = studentLogin.body.data.token;

    const quizRes = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Student Quiz',
        topic: 'Hacking',
        durationMinutes: 10,
      });

    expect(quizRes.status).toBe(403);
    expect(quizRes.body.success).toBe(false);
  });
});
