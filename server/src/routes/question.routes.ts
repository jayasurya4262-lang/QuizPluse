import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  type: z.enum(['MCQ', 'SHORT_ANSWER']),
  text: z.string().min(2, 'Question text must be at least 2 characters'),
  marks: z.number().int().min(1, 'Marks must be at least 1'),
  explanation: z.string().optional().nullable(),
  expectedAnswer: z.string().optional().nullable(),
  options: z.array(optionSchema).optional(),
});

// Helper: verify quiz ownership
async function verifyQuizOwner(quizId: string, teacherId: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { error: 'Quiz not found', status: 404 };
  if (quiz.teacherId !== teacherId) return { error: 'Forbidden', status: 403 };
  return { quiz };
}

// POST /api/quizzes/:quizId/questions - TRIAL-22: Add question
router.post(
  '/:quizId/questions',
  requireAuth,
  requireRole('TEACHER'),
  validate(questionSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params as { quizId: string };
      const { type, text, marks, explanation, expectedAnswer, options } = req.body;

      const check = await verifyQuizOwner(quizId, req.user!.id);
      if (check.error) {
        res.status(check.status).json({ success: false, message: check.error });
        return;
      }

      // Count existing questions to set orderIndex
      const count = await prisma.question.count({ where: { quizId } });

      const newQuestion = await prisma.$transaction(async (tx: any) => {
        const question = await tx.question.create({
          data: {
            quizId,
            type,
            text,
            marks,
            explanation: explanation || null,
            expectedAnswer: expectedAnswer || null,
            orderIndex: count,
          },
        });

        if (type === 'MCQ' && options && options.length > 0) {
          await tx.questionOption.createMany({
            data: options.map((opt: any, idx: number) => ({
              questionId: question.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
              orderIndex: idx,
            })),
          });
        }

        return tx.question.findUnique({
          where: { id: question.id },
          include: { options: true },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Question added successfully.',
        data: { question: newQuestion },
      });
    } catch (error) {
      console.error('Add question error:', error);
      res.status(500).json({ success: false, message: 'Server error adding question.' });
    }
  }
);

// PUT /api/quizzes/:quizId/questions/:questionId - TRIAL-23: Edit question
router.put(
  '/:quizId/questions/:questionId',
  requireAuth,
  requireRole('TEACHER'),
  validate(questionSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId, questionId } = req.params as { quizId: string; questionId: string };
      const { type, text, marks, explanation, expectedAnswer, options } = req.body;

      const check = await verifyQuizOwner(quizId, req.user!.id);
      if (check.error) {
        res.status(check.status).json({ success: false, message: check.error });
        return;
      }

      const existingQuestion = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!existingQuestion || existingQuestion.quizId !== quizId) {
        res.status(404).json({ success: false, message: 'Question not found on this quiz.' });
        return;
      }

      const updatedQuestion = await prisma.$transaction(async (tx: any) => {
        await tx.question.update({
          where: { id: questionId },
          data: {
            type,
            text,
            marks,
            explanation: explanation || null,
            expectedAnswer: expectedAnswer || null,
          },
        });

        // If options provided, replace options
        if (type === 'MCQ' && options) {
          await tx.questionOption.deleteMany({ where: { questionId } });
          await tx.questionOption.createMany({
            data: options.map((opt: any, idx: number) => ({
              questionId,
              text: opt.text,
              isCorrect: opt.isCorrect,
              orderIndex: idx,
            })),
          });
        }

        return tx.question.findUnique({
          where: { id: questionId },
          include: { options: true },
        });
      });

      res.json({
        success: true,
        message: 'Question updated successfully.',
        data: { question: updatedQuestion },
      });
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({ success: false, message: 'Server error updating question.' });
    }
  }
);

// DELETE /api/quizzes/:quizId/questions/:questionId - TRIAL-23: Delete question
router.delete(
  '/:quizId/questions/:questionId',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId, questionId } = req.params as { quizId: string; questionId: string };

      const check = await verifyQuizOwner(quizId, req.user!.id);
      if (check.error) {
        res.status(check.status).json({ success: false, message: check.error });
        return;
      }

      const question = await prisma.question.findUnique({ where: { id: questionId } });
      if (!question || question.quizId !== quizId) {
        res.status(404).json({ success: false, message: 'Question not found.' });
        return;
      }

      await prisma.question.delete({ where: { id: questionId } });

      res.json({ success: true, message: 'Question deleted successfully.' });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({ success: false, message: 'Server error deleting question.' });
    }
  }
);

// POST /api/quizzes/:quizId/questions/reorder - Reorder questions
router.post(
  '/:quizId/questions/reorder',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params as { quizId: string };
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array of IDs.' });
        return;
      }

      const check = await verifyQuizOwner(quizId, req.user!.id);
      if (check.error) {
        res.status(check.status).json({ success: false, message: check.error });
        return;
      }

      await prisma.$transaction(
        orderedIds.map((id: string, index: number) =>
          prisma.question.update({
            where: { id },
            data: { orderIndex: index },
          })
        )
      );

      res.json({ success: true, message: 'Questions reordered successfully.' });
    } catch (error) {
      console.error('Reorder error:', error);
      res.status(500).json({ success: false, message: 'Server error reordering questions.' });
    }
  }
);

export default router;
