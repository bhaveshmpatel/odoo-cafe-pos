import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@repo/database';
import { LoginRequest, LoginResponse, ApiResult } from '@repo/shared-types';

const router: Router = Router();

router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response<ApiResult<LoginResponse>>) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'User account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_hackathon_key', { expiresIn: '1d' });

    // Exclude password_hash
    const { password_hash, ...userWithoutPassword } = user;

    // Convert Date to string for exact type match
    const responseUser = {
      ...userWithoutPassword,
      role: userWithoutPassword.role as any, // or as UserRole if imported
      created_at: userWithoutPassword.created_at.toISOString(),
      updated_at: userWithoutPassword.updated_at.toISOString(),
    };

    return res.json({
      success: true,
      data: {
        token,
        user: responseUser,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
