import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@repo/database';
import { LoginRequest, LoginResponse, ApiResult } from '@repo/shared-types';
import crypto from 'crypto';

const router: Router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hackathon_key';

// Standard Login
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response<ApiResult<LoginResponse>>) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        token,
        user: {
          ...userWithoutPassword,
          role: userWithoutPassword.role as any,
          created_at: userWithoutPassword.created_at.toISOString(),
          updated_at: userWithoutPassword.updated_at.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Standard Register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, error: 'Email, password, and full_name are required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password_hash, full_name, role: 'EMPLOYEE' }
    });

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const { password_hash: _ph, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        token,
        user: {
          ...userWithoutPassword,
          role: userWithoutPassword.role as any,
          created_at: userWithoutPassword.created_at.toISOString(),
          updated_at: userWithoutPassword.updated_at.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Google OAuth Backend Flow
router.post('/google', async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required from Google' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user with dummy password if they don't exist
      const dummyPassword = crypto.randomBytes(32).toString('hex');
      const password_hash = await bcrypt.hash(dummyPassword, 10);

      user = await prisma.user.create({
        data: { email, password_hash, full_name: name || 'Google User', role: 'EMPLOYEE' }
      });
    } else if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is inactive' });
    }

    const payload = { userId: user.id, email: user.email, role: user.role, name: user.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        token,
        user: {
          ...userWithoutPassword,
          role: userWithoutPassword.role as any,
          created_at: userWithoutPassword.created_at.toISOString(),
          updated_at: userWithoutPassword.updated_at.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
