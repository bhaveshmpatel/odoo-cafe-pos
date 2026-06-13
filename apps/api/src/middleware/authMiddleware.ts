import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, ApiError } from '@repo/shared-types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const error: ApiError = { success: false, error: 'Access token missing' };
    return res.status(401).json(error);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_hackathon_key', (err, decoded) => {
    if (err) {
      const error: ApiError = { success: false, error: 'Invalid or expired token' };
      return res.status(403).json(error);
    }
    
    req.user = decoded as JwtPayload;
    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    const error: ApiError = { success: false, error: 'Admin privileges required' };
    return res.status(403).json(error);
  }
  next();
};
