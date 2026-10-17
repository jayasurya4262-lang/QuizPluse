import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET: any = process.env.JWT_SECRET || 'super_secret_jwt_key_quizpulse_2026_change_in_production';
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// TRIAL-16: Student registration
router.post(
  '/register-student',
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'STUDENT',
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.status(201).json({
        success: true,
        message: 'Student account created successfully.',
        data: { user, token },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error during student registration.' });
    }
  }
);

// TRIAL-17: Teacher registration
router.post(
  '/register-teacher',
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'TEACHER',
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.status(201).json({
        success: true,
        message: 'Teacher account created successfully.',
        data: { user, token },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error during teacher registration.' });
    }
  }
);

// TRIAL-1, TRIAL-18: Login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };

      res.json({
        success: true,
        message: 'Login successful.',
        data: { user: safeUser, token },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  }
);

// TRIAL-18: Logout endpoint (for client-side token discard and optional server audit)
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// TRIAL-19: Request Password Reset Token
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Always return a positive message to avoid email enumeration
      if (!user) {
        res.json({
          success: true,
          message: 'If that email exists in our system, a password reset token has been issued.',
        });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      res.json({
        success: true,
        message: 'Password reset token generated successfully.',
        data: {
          token: resetToken,
          expiresAt,
        },
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Server error during password reset request.' });
    }
  }
);

// TRIAL-19: Reset Password with Token
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Invalid, expired, or already used reset token.',
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetRecord.id },
          data: { used: true },
        }),
      ]);

      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Server error resetting password.' });
    }
  }
);

// Current authenticated user profile
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

export default router;
