import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const createQuizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  topic: z.string().min(2, 'Topic is required'),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(180, 'Duration cannot exceed 180 minutes'),
  passingScore: z.number().min(0).max(100).optional().nullable(),
  shuffleQuestions: z.boolean().optional(),
});

const updateQuizSchema = createQuizSchema.partial();

// GET /api/quizzes - List quizzes
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isTeacher = req.user?.role === 'TEACHER';
    const statusQuery = req.query.status as string | undefined;
    const topicQuery = req.query.topic as string | undefined;
    const searchQuery = req.query.search as string | undefined;

    let whereClause: any = {};

    if (isTeacher && req.query.myQuizzes === 'true') {
      whereClause.teacherId = req.user!.id;
      if (statusQuery) {
        whereClause.status = statusQuery;
      }
    } else {
      // Default / public / student: only published
      whereClause.status = 'PUBLISHED';
    }

    if (topicQuery && topicQuery !== 'all') {
      whereClause.topic = topicQuery;
    }

    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        teacher: { select: { id: true, name: true } },
        questions: {
          select: {
            id: true,
            marks: true,
            type: true,
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedQuizzes = quizzes.map((q: any) => {
      const totalMarks = q.questions.reduce((sum: number, item: any) => sum + item.marks, 0);
      const questionCount = q.questions.length;
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        topic: q.topic,
        durationMinutes: q.durationMinutes,
        passingScore: q.passingScore,
        status: q.status,
        teacher: q.teacher,
        questionCount,
        totalMarks,
        attemptCount: q._count.attempts,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });

    res.json({
      success: true,
      data: { quizzes: formattedQuizzes },
    });
  } catch (error) {
    console.error('List quizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving quizzes.' });
  }
});

// GET /api/quizzes/:id - Quiz details
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const quiz: any = await prisma.quiz.findUnique({
      where: { id },
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
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found.' });
      return;
    }

    const isOwner = req.user && quiz.teacherId === req.user.id;

    // If not owner, must be published
    if (!isOwner && quiz.status !== 'PUBLISHED') {
      res.status(403).json({ success: false, message: 'This quiz is not available.' });
      return;
    }

    const totalMarks = quiz.questions.reduce((sum: number, q: any) => sum + q.marks, 0);

    // If student/public, strip answer keys and explanations
    const sanitizedQuestions = quiz.questions.map((q: any) => {
      if (isOwner) {
        return q;
      }
      return {
        id: q.id,
        type: q.type,
        text: q.text,
        marks: q.marks,
        orderIndex: q.orderIndex,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          orderIndex: opt.orderIndex,
        })),
      };
    });

    res.json({
      success: true,
      data: {
        quiz: {
          ...quiz,
          totalMarks,
          questions: sanitizedQuestions,
        },
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving quiz.' });
  }
});

// POST /api/quizzes - TRIAL-21: Create Quiz (Teacher only)
router.post(
  '/',
  requireAuth,
  requireRole('TEACHER'),
  validate(createQuizSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, topic, durationMinutes, passingScore, shuffleQuestions } = req.body;

      const quiz = await prisma.quiz.create({
        data: {
          title,
          description: description || null,
          topic,
          durationMinutes,
          passingScore: passingScore !== undefined ? passingScore : 60,
          shuffleQuestions: shuffleQuestions || false,
          status: 'DRAFT',
          teacherId: req.user!.id,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully as DRAFT.',
        data: { quiz },
      });
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ success: false, message: 'Server error creating quiz.' });
    }
  }
);

// PUT /api/quizzes/:id - Update Quiz (Owner Teacher only)
router.put(
  '/:id',
  requireAuth,
  requireRole('TEACHER'),
  validate(updateQuizSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };

      const existingQuiz = await prisma.quiz.findUnique({ where: { id } });
      if (!existingQuiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      if (existingQuiz.teacherId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'You do not have permission to edit this quiz.' });
        return;
      }

      const updated = await prisma.quiz.update({
        where: { id },
        data: req.body,
      });

      res.json({
        success: true,
        message: 'Quiz updated successfully.',
        data: { quiz: updated },
      });
    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ success: false, message: 'Server error updating quiz.' });
    }
  }
);

// POST /api/quizzes/:id/publish - TRIAL-26: Publish Quiz (Owner Teacher only with validation)
router.post(
  '/:id/publish',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };

      const quiz: any = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: {
            include: { options: true },
          },
        },
      });

      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      if (quiz.teacherId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'You can only publish your own quizzes.' });
        return;
      }

      // Validation requirements for publishing
      const validationErrors: string[] = [];

      if (!quiz.title || quiz.title.trim().length < 3) {
        validationErrors.push('Quiz title must be at least 3 characters.');
      }

      if (!quiz.durationMinutes || quiz.durationMinutes <= 0) {
        validationErrors.push('Quiz duration must be greater than 0 minutes.');
      }

      if (quiz.questions.length === 0) {
        validationErrors.push('Quiz must contain at least 1 question before publishing.');
      }

      quiz.questions.forEach((q: any, index: number) => {
        const qNum = index + 1;
        if (!q.text || q.text.trim().length === 0) {
          validationErrors.push(`Question #${qNum} has no question text.`);
        }
        if (q.marks <= 0) {
          validationErrors.push(`Question #${qNum} marks must be greater than 0.`);
        }
        if (q.type === 'MCQ') {
          if (q.options.length < 2) {
            validationErrors.push(`Question #${qNum} (MCQ) must have at least 2 options.`);
          }
          const correctCount = q.options.filter((o: any) => o.isCorrect).length;
          if (correctCount !== 1) {
            validationErrors.push(
              `Question #${qNum} (MCQ) must have exactly one correct option selected (currently ${correctCount}).`
            );
          }
        } else if (q.type === 'SHORT_ANSWER') {
          if (!q.expectedAnswer || q.expectedAnswer.trim().length === 0) {
            validationErrors.push(`Question #${qNum} (Short Answer) requires an expected answer key.`);
          }
        }
      });

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot publish quiz: Validation checks failed.',
          errors: validationErrors,
        });
        return;
      }

      const publishedQuiz = await prisma.quiz.update({
        where: { id },
        data: { status: 'PUBLISHED' },
      });

      res.json({
        success: true,
        message: 'Quiz successfully validated and published! Students can now participate.',
        data: { quiz: publishedQuiz },
      });
    } catch (error) {
      console.error('Publish quiz error:', error);
      res.status(500).json({ success: false, message: 'Server error publishing quiz.' });
    }
  }
);

// POST /api/quizzes/:id/unpublish - Revert to Draft
router.post(
  '/:id/unpublish',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };

      const quiz = await prisma.quiz.findUnique({ where: { id } });
      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }
      if (quiz.teacherId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const updated = await prisma.quiz.update({
        where: { id },
        data: { status: 'DRAFT' },
      });

      res.json({
        success: true,
        message: 'Quiz reverted to DRAFT status.',
        data: { quiz: updated },
      });
    } catch (error) {
      console.error('Unpublish error:', error);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// DELETE /api/quizzes/:id - Delete Quiz
router.delete(
  '/:id',
  requireAuth,
  requireRole('TEACHER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };

      const quiz = await prisma.quiz.findUnique({ where: { id } });
      if (!quiz) {
        res.status(404).json({ success: false, message: 'Quiz not found.' });
        return;
      }

      if (quiz.teacherId !== req.user!.id) {
        res.status(403).json({ success: false, message: 'You can only delete your own quizzes.' });
        return;
      }

      await prisma.quiz.delete({ where: { id } });

      res.json({ success: true, message: 'Quiz deleted successfully.' });
    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ success: false, message: 'Server error deleting quiz.' });
    }
  }
);

export default router;
