import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { evaluateAttempt } from '../services/evaluation.service';

const router = Router();

const startAttemptSchema = z.object({
  quizId: z.string().min(1, 'quizId is required'),
});

const saveAnswerSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  selectedOptionId: z.string().optional().nullable(),
  textAnswer: z.string().optional().nullable(),
});

// POST /api/attempts/start - TRIAL-28: Start or Resume quiz attempt
router.post(
  '/start',
  requireAuth,
  requireRole('STUDENT'),
  validate(startAttemptSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId } = req.body;
      const studentId = req.user!.id;

      const quiz: any = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' },
            include: {
              options: {
                orderBy: { orderIndex: 'asc' },
                select: { id: true, text: true, orderIndex: true },
              },
            },
          },
        },
      });

      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      if (quiz.status !== 'PUBLISHED') {
        res.status(400).json({ success: false, message: 'Cannot attempt a quiz that is not published.' });
        return;
      }

      if (quiz.questions.length === 0) {
        res.status(400).json({ success: false, message: 'This quiz has no questions.' });
        return;
      }

      // Check if student already has an active attempt
      let attempt: any = await prisma.quizAttempt.findFirst({
        where: {
          quizId,
          studentId,
          status: 'IN_PROGRESS',
        },
        include: {
          answers: true,
        },
      });

      const now = new Date();

      if (attempt) {
        // Check if deadline passed
        if (now > attempt.deadline) {
          attempt = await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: { status: 'EXPIRED' },
            include: { answers: true },
          });
        }
      }

      // If no valid active attempt, create a new one
      if (!attempt || attempt.status !== 'IN_PROGRESS') {
        const startedAt = now;
        const deadline = new Date(startedAt.getTime() + quiz.durationMinutes * 60 * 1000);

        attempt = await prisma.quizAttempt.create({
          data: {
            quizId,
            studentId,
            status: 'IN_PROGRESS',
            startedAt,
            deadline,
          },
          include: {
            answers: true,
          },
        });
      }

      const sanitizedQuestions = quiz.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        marks: q.marks,
        orderIndex: q.orderIndex,
        options: q.options,
      }));

      const remainingSeconds = Math.max(0, Math.floor((attempt.deadline.getTime() - Date.now()) / 1000));

      res.status(200).json({
        success: true,
        message: 'Quiz attempt started successfully.',
        data: {
          attempt: {
            id: attempt.id,
            quizId: attempt.quizId,
            quizTitle: quiz.title,
            durationMinutes: quiz.durationMinutes,
            startedAt: attempt.startedAt,
            deadline: attempt.deadline,
            remainingSeconds,
            status: attempt.status,
            answers: attempt.answers.map((a: any) => ({
              questionId: a.questionId,
              selectedOptionId: a.selectedOptionId,
              textAnswer: a.textAnswer,
            })),
          },
          questions: sanitizedQuestions,
        },
      });
    } catch (error) {
      console.error('Start attempt error:', error);
      res.status(500).json({ success: false, message: 'Server error starting quiz attempt.' });
    }
  }
);

// GET /api/attempts/:attemptId - Get Attempt state & remaining time
router.get(
  '/:attemptId',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { attemptId } = req.params as { attemptId: string };

      const attempt: any = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: {
            include: {
              questions: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  options: {
                    select: { id: true, text: true, orderIndex: true },
                  },
                },
              },
            },
          },
          answers: true,
        },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: 'Attempt not found.' });
        return;
      }

      if (req.user!.role === 'STUDENT' && attempt.studentId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden. Not your attempt.' });
        return;
      }

      const remainingSeconds = Math.max(0, Math.floor((attempt.deadline.getTime() - Date.now()) / 1000));

      const sanitizedQuestions = attempt.quiz.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        marks: q.marks,
        orderIndex: q.orderIndex,
        options: q.options,
      }));

      res.json({
        success: true,
        data: {
          attempt: {
            id: attempt.id,
            quizId: attempt.quizId,
            quizTitle: attempt.quiz.title,
            durationMinutes: attempt.quiz.durationMinutes,
            startedAt: attempt.startedAt,
            deadline: attempt.deadline,
            remainingSeconds,
            status: attempt.status,
            score: attempt.score,
            totalMarks: attempt.totalMarks,
            percentage: attempt.percentage,
            passed: attempt.passed,
            answers: attempt.answers.map((a: any) => ({
              questionId: a.questionId,
              selectedOptionId: a.selectedOptionId,
              textAnswer: a.textAnswer,
            })),
          },
          questions: sanitizedQuestions,
        },
      });
    } catch (error) {
      console.error('Get attempt error:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving attempt.' });
    }
  }
);

// POST /api/attempts/:attemptId/save-answer - Save student answer
router.post(
  '/:attemptId/save-answer',
  requireAuth,
  requireRole('STUDENT'),
  validate(saveAnswerSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { attemptId } = req.params as { attemptId: string };
      const { questionId, selectedOptionId, textAnswer } = req.body;

      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: 'Attempt not found.' });
        return;
      }

      if (attempt.studentId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden.' });
        return;
      }

      if (attempt.status !== 'IN_PROGRESS') {
        res.status(400).json({ success: false, message: 'This attempt is locked and already submitted.' });
        return;
      }

      const gracePeriodMs = 10000;
      if (Date.now() > attempt.deadline.getTime() + gracePeriodMs) {
        res.status(400).json({ success: false, message: 'Quiz time has expired.' });
        return;
      }

      await prisma.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId,
          },
        },
        create: {
          attemptId,
          questionId,
          selectedOptionId: selectedOptionId || null,
          textAnswer: textAnswer || null,
        },
        update: {
          selectedOptionId: selectedOptionId || null,
          textAnswer: textAnswer || null,
          savedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Answer saved successfully.',
      });
    } catch (error) {
      console.error('Save answer error:', error);
      res.status(500).json({ success: false, message: 'Server error saving answer.' });
    }
  }
);

// POST /api/attempts/:attemptId/submit - Submit and evaluate quiz
router.post(
  '/:attemptId/submit',
  requireAuth,
  requireRole('STUDENT'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { attemptId } = req.params as { attemptId: string };

      const attempt: any = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: {
            include: {
              questions: {
                include: { options: true },
              },
            },
          },
          answers: true,
        },
      });

      if (!attempt) {
        res.status(404).json({ success: false, message: 'Attempt not found.' });
        return;
      }

      if (attempt.studentId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Forbidden. Not your attempt.' });
        return;
      }

      if (attempt.status === 'SUBMITTED') {
        res.json({
          success: true,
          message: 'Quiz was already submitted.',
          data: {
            attempt: {
              id: attempt.id,
              status: attempt.status,
              score: attempt.score,
              totalMarks: attempt.totalMarks,
              percentage: attempt.percentage,
              passed: attempt.passed,
              correctCount: attempt.correctCount,
              incorrectCount: attempt.incorrectCount,
              unansweredCount: attempt.unansweredCount,
              submittedAt: attempt.submittedAt,
            },
          },
        });
        return;
      }

      const evalOutcome = evaluateAttempt(
        attempt.quiz.questions,
        attempt.answers,
        attempt.quiz.passingScore
      );

      const now = new Date();
      const updatedAttempt = await prisma.$transaction(async (tx: any) => {
        for (const item of evalOutcome.evaluatedAnswers) {
          await tx.attemptAnswer.upsert({
            where: {
              attemptId_questionId: {
                attemptId,
                questionId: item.questionId,
              },
            },
            create: {
              attemptId,
              questionId: item.questionId,
              selectedOptionId: item.selectedOptionId,
              textAnswer: item.textAnswer,
              isCorrect: item.isCorrect,
              marksAwarded: item.marksAwarded,
            },
            update: {
              isCorrect: item.isCorrect,
              marksAwarded: item.marksAwarded,
            },
          });
        }

        return tx.quizAttempt.update({
          where: { id: attemptId },
          data: {
            status: 'SUBMITTED',
            submittedAt: now,
            score: evalOutcome.score,
            totalMarks: evalOutcome.totalMarks,
            percentage: evalOutcome.percentage,
            passed: evalOutcome.passed,
            correctCount: evalOutcome.correctCount,
            incorrectCount: evalOutcome.incorrectCount,
            unansweredCount: evalOutcome.unansweredCount,
          },
        });
      });

      res.json({
        success: true,
        message: 'Quiz submitted and evaluated successfully!',
        data: {
          attempt: updatedAttempt,
        },
      });
    } catch (error) {
      console.error('Submit attempt error:', error);
      res.status(500).json({ success: false, message: 'Server error submitting attempt.' });
    }
  }
);

export default router;
