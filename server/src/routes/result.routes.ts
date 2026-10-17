import { Router, Response } from 'express';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/results/:attemptId - TRIAL-35, TRIAL-36: Get detailed score & review breakdown
router.get(
  '/:attemptId',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { attemptId } = req.params as { attemptId: string };

      const attempt: any = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          quiz: {
            include: {
              teacher: { select: { id: true, name: true } },
              questions: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  options: {
                    orderBy: { orderIndex: 'asc' },
                  },
                },
              },
            },
          },
          answers: true,
        },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: 'Result not found.' });
        return;
      }

      // Check permission: student who took the attempt, OR the teacher who created the quiz
      const isStudentOwner = attempt.studentId === req.user!.id;
      const isQuizTeacher = attempt.quiz.teacherId === req.user!.id;

      if (!isStudentOwner && !isQuizTeacher) {
        res.status(403).json({ success: false, message: 'Forbidden. You cannot view this result.' });
        return;
      }

      if (attempt.status !== 'SUBMITTED' && attempt.status !== 'EXPIRED') {
        res.status(400).json({ success: false, message: 'This attempt has not been submitted yet.' });
        return;
      }

      const answerMap = new Map();
      attempt.answers.forEach((ans: any) => answerMap.set(ans.questionId, ans));

      // Construct detailed review per question
      const reviewQuestions = attempt.quiz.questions.map((q: any) => {
        const studentAns = answerMap.get(q.id);
        const correctOpt = q.options.find((o: any) => o.isCorrect);

        return {
          id: q.id,
          type: q.type,
          text: q.text,
          marks: q.marks,
          orderIndex: q.orderIndex,
          explanation: q.explanation,
          expectedAnswer: q.expectedAnswer,
          options: q.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
          studentAnswer: {
            selectedOptionId: studentAns?.selectedOptionId || null,
            textAnswer: studentAns?.textAnswer || null,
            isCorrect: studentAns?.isCorrect ?? false,
            marksAwarded: studentAns?.marksAwarded ?? 0,
            isUnanswered: !studentAns || (!studentAns.selectedOptionId && !studentAns.textAnswer),
          },
          correctAnswerText:
            q.type === 'MCQ'
              ? correctOpt?.text || 'N/A'
              : q.expectedAnswer || 'N/A',
        };
      });

      const durationTakenSeconds = attempt.submittedAt
        ? Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000)
        : null;

      res.json({
        success: true,
        data: {
          result: {
            attemptId: attempt.id,
            quizId: attempt.quizId,
            quizTitle: attempt.quiz.title,
            quizTopic: attempt.quiz.topic,
            passingScore: attempt.quiz.passingScore,
            student: attempt.student,
            teacher: attempt.quiz.teacher,
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            durationTakenSeconds,
            status: attempt.status,
            score: attempt.score,
            totalMarks: attempt.totalMarks,
            percentage: attempt.percentage,
            passed: attempt.passed,
            correctCount: attempt.correctCount,
            incorrectCount: attempt.incorrectCount,
            unansweredCount: attempt.unansweredCount,
            reviewQuestions,
          },
        },
      });
    } catch (error) {
      console.error('Get result error:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving result.' });
    }
  }
);

export default router;
