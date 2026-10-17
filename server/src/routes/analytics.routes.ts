import { Router, Response } from 'express';
import prisma from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics/student/attempts - TRIAL-39: Student attempt history
router.get(
  '/student/attempts',
  requireAuth,
  requireRole('STUDENT'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.user!.id;
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'EXPIRED'] },
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              topic: true,
              durationMinutes: true,
              passingScore: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      const formatted = attempts.map((att) => ({
        id: att.id,
        quizId: att.quiz.id,
        quizTitle: att.quiz.title,
        topic: att.quiz.topic,
        score: att.score,
        totalMarks: att.totalMarks,
        percentage: att.percentage,
        passed: att.passed,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt,
        status: att.status,
      }));

      res.json({
        success: true,
        data: { attempts: formatted },
      });
    } catch (error) {
      console.error('Student attempts error:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving attempts.' });
    }
  }
);

// GET /api/analytics/student/overview - TRIAL-40: Student performance trends & topic breakdown
router.get(
  '/student/overview',
  requireAuth,
  requireRole('STUDENT'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.user!.id;

      const attempts = await prisma.quizAttempt.findMany({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'EXPIRED'] },
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              topic: true,
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
      });

      const totalAttempts = attempts.length;
      if (totalAttempts === 0) {
        res.json({
          success: true,
          data: {
            totalAttempts: 0,
            completedQuizzes: 0,
            averageScorePercentage: 0,
            passRatePercentage: 0,
            trend: [],
            topicWise: [],
          },
        });
        return;
      }

      const passedCount = attempts.filter((a) => a.passed === true).length;
      const passRatePercentage = Math.round((passedCount / totalAttempts) * 100);

      const totalScoreSum = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
      const averageScorePercentage = Math.round((totalScoreSum / totalAttempts) * 10) / 10;

      // Trend over time
      const trend = attempts.map((a, idx) => ({
        attemptNumber: idx + 1,
        quizTitle: a.quiz.title,
        date: a.submittedAt ? a.submittedAt.toISOString().split('T')[0] : '',
        percentage: a.percentage || 0,
        score: a.score || 0,
        totalMarks: a.totalMarks || 0,
      }));

      // Topic-wise progress
      const topicMap = new Map<string, { totalPercentage: number; count: number }>();
      attempts.forEach((a) => {
        const topic = a.quiz.topic || 'General';
        const curr = topicMap.get(topic) || { totalPercentage: 0, count: 0 };
        curr.totalPercentage += a.percentage || 0;
        curr.count += 1;
        topicMap.set(topic, curr);
      });

      const topicWise = Array.from(topicMap.entries()).map(([topic, data]) => ({
        topic,
        averagePercentage: Math.round((data.totalPercentage / data.count) * 10) / 10,
        attemptsCount: data.count,
      }));

      res.json({
        success: true,
        data: {
          totalAttempts,
          completedQuizzes: totalAttempts,
          averageScorePercentage,
          passRatePercentage,
          trend,
          topicWise,
        },
      });
    } catch (error) {
      console.error('Student overview error:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving student analytics.' });
    }
  }
);

// GET /api/analytics/leaderboard - TRIAL-41: Leaderboard
router.get('/leaderboard', async (_req: any, res: Response): Promise<void> => {
  try {
    // Group attempts by student
    const studentAttempts = await prisma.quizAttempt.groupBy({
      by: ['studentId'],
      where: {
        status: 'SUBMITTED',
      },
      _count: {
        id: true,
      },
      _sum: {
        score: true,
      },
      _avg: {
        percentage: true,
      },
      orderBy: {
        _sum: {
          score: 'desc',
        },
      },
      take: 20,
    });

    const studentIds = studentAttempts.map((s) => s.studentId);
    const users = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = studentAttempts.map((entry, index) => {
      const user = userMap.get(entry.studentId);
      return {
        rank: index + 1,
        studentId: entry.studentId,
        studentName: user ? user.name : 'Student',
        totalScore: Math.round((entry._sum.score || 0) * 10) / 10,
        averagePercentage: Math.round((entry._avg.percentage || 0) * 10) / 10,
        quizzesCompleted: entry._count.id,
      };
    });

    res.json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving leaderboard.' });
  }
});

// GET /api/analytics/teacher/overview - EPIC TRIAL-15: Teacher Dashboard Analytics
router.get(
  '/teacher/overview',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teacherId = req.user!.id;

      const quizzes = await prisma.quiz.findMany({
        where: { teacherId },
        include: {
          attempts: {
            where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
            include: {
              student: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      const totalQuizzes = quizzes.length;
      const publishedQuizzes = quizzes.filter((q) => q.status === 'PUBLISHED').length;
      const draftQuizzes = quizzes.filter((q) => q.status === 'DRAFT').length;

      const allAttempts = quizzes.flatMap((q) =>
        q.attempts.map((att) => ({
          ...att,
          quizTitle: q.title,
        }))
      );

      const totalAttempts = allAttempts.length;
      const uniqueStudents = new Set(allAttempts.map((a) => a.studentId)).size;

      const avgScore =
        totalAttempts > 0
          ? Math.round(
              (allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts) * 10
            ) / 10
          : 0;

      // Recent 10 student attempts
      const recentAttempts = allAttempts
        .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))
        .slice(0, 8)
        .map((a) => ({
          id: a.id,
          studentName: a.student.name,
          studentEmail: a.student.email,
          quizTitle: a.quizTitle,
          score: a.score,
          totalMarks: a.totalMarks,
          percentage: a.percentage,
          passed: a.passed,
          submittedAt: a.submittedAt,
        }));

      res.json({
        success: true,
        data: {
          totalQuizzes,
          publishedQuizzes,
          draftQuizzes,
          totalAttempts,
          uniqueStudents,
          averageScorePercentage: avgScore,
          recentAttempts,
        },
      });
    } catch (error) {
      console.error('Teacher overview error:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving teacher overview.' });
    }
  }
);

// GET /api/analytics/teacher/quiz/:quizId - EPIC TRIAL-15: Quiz-specific deep analytics
router.get(
  '/teacher/quiz/:quizId',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params as { quizId: string };
      const teacherId = req.user!.id;

      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' },
            include: { options: true },
          },
          attempts: {
            where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
            include: {
              student: { select: { id: true, name: true, email: true } },
              answers: true,
            },
            orderBy: { submittedAt: 'desc' },
          },
        },
      });

      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      if (quiz.teacherId !== teacherId) {
        res.status(403).json({ success: false, message: 'Forbidden. Not your quiz.' });
        return;
      }

      const totalAttempts = quiz.attempts.length;
      const passedCount = quiz.attempts.filter((a) => a.passed === true).length;
      const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
      const averagePercentage =
        totalAttempts > 0
          ? Math.round(
              (quiz.attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts) * 10
            ) / 10
          : 0;

      // Score distribution buckets
      const distribution = {
        '0-25%': 0,
        '26-50%': 0,
        '51-75%': 0,
        '76-100%': 0,
      };

      quiz.attempts.forEach((a) => {
        const p = a.percentage || 0;
        if (p <= 25) distribution['0-25%']++;
        else if (p <= 50) distribution['26-50%']++;
        else if (p <= 75) distribution['51-75%']++;
        else distribution['76-100%']++;
      });

      // Question-level accuracy breakdown
      const questionAccuracy = quiz.questions.map((q) => {
        const allAnswersForQ = quiz.attempts.flatMap((att) =>
          att.answers.filter((ans) => ans.questionId === q.id)
        );
        const answeredCount = allAnswersForQ.length;
        const correctCount = allAnswersForQ.filter((ans) => ans.isCorrect === true).length;
        const accuracyRate =
          totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

        return {
          questionId: q.id,
          questionText: q.text,
          type: q.type,
          marks: q.marks,
          totalAttempts,
          answeredCount,
          correctCount,
          accuracyRate,
        };
      });

      // Participants table
      const participants = quiz.attempts.map((att) => ({
        attemptId: att.id,
        studentId: att.student.id,
        studentName: att.student.name,
        studentEmail: att.student.email,
        score: att.score,
        totalMarks: att.totalMarks,
        percentage: att.percentage,
        passed: att.passed,
        correctCount: att.correctCount,
        incorrectCount: att.incorrectCount,
        unansweredCount: att.unansweredCount,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt,
        status: att.status,
      }));

      res.json({
        success: true,
        data: {
          quiz: {
            id: quiz.id,
            title: quiz.title,
            topic: quiz.topic,
            passingScore: quiz.passingScore,
            status: quiz.status,
          },
          metrics: {
            totalAttempts,
            passRate,
            averagePercentage,
            passedCount,
            failedCount: totalAttempts - passedCount,
          },
          distribution,
          questionAccuracy,
          participants,
        },
      });
    } catch (error) {
      console.error('Quiz analytics error:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving quiz analytics.' });
    }
  }
);

// GET /api/analytics/teacher/quiz/:quizId/export-csv - EPIC TRIAL-15: Export CSV
router.get(
  '/teacher/quiz/:quizId/export-csv',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params as { quizId: string };
      const teacherId = req.user!.id;

      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          attempts: {
            where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
            include: {
              student: { select: { name: true, email: true } },
            },
            orderBy: { submittedAt: 'desc' },
          },
        },
      });

      if (!quiz || quiz.teacherId !== teacherId) {
        res.status(403).json({ success: false, message: 'Forbidden.' });
        return;
      }

      // Format CSV header
      const headers = [
        'Student Name',
        'Email',
        'Score',
        'Total Marks',
        'Percentage',
        'Passed',
        'Status',
        'Started At',
        'Submitted At',
      ];

      const rows = quiz.attempts.map((att) => [
        `"${att.student.name.replace(/"/g, '""')}"`,
        `"${att.student.email.replace(/"/g, '""')}"`,
        att.score ?? 0,
        att.totalMarks ?? 0,
        `${att.percentage ?? 0}%`,
        att.passed === true ? 'PASS' : att.passed === false ? 'FAIL' : 'N/A',
        att.status,
        att.startedAt.toISOString(),
        att.submittedAt ? att.submittedAt.toISOString() : 'N/A',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const safeFilename = quiz.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeFilename}_Results.csv"`
      );
      res.send(csvContent);
    } catch (error) {
      console.error('Export CSV error:', error);
      res.status(500).json({ success: false, message: 'Server error generating CSV.' });
    }
  }
);

export default router;
