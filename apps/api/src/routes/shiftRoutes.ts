import { Router, Request, Response } from 'express';
import prisma from '@repo/database';
import { ShiftStatus } from '@repo/shared-types';

const router: Router = Router();

// Get current open shift for a user
router.get('/current', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const shift = await prisma.shiftSession.findFirst({
      where: {
        user_id: user.userId,
        status: ShiftStatus.OPEN,
      },
    });

    res.json({ success: true, data: shift });
  } catch (error) {
    console.error('Failed to get current shift', error);
    res.status(500).json({ success: false, error: 'Failed to get current shift' });
  }
});

// Open a new shift
router.post('/open', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { starting_cash } = req.body;

    // Check if there's already an open shift
    const existing = await prisma.shiftSession.findFirst({
      where: {
        user_id: user.userId,
        status: ShiftStatus.OPEN,
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'A shift is already open.' });
    }

    const shift = await prisma.shiftSession.create({
      data: {
        user_id: user.userId,
        starting_cash: starting_cash,
        status: ShiftStatus.OPEN,
      },
    });

    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    console.error('Failed to open shift', error);
    res.status(500).json({ success: false, error: 'Failed to open shift' });
  }
});

// Close shift
router.post('/close', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { ending_cash, expected_cash, notes } = req.body;

    const openShift = await prisma.shiftSession.findFirst({
      where: {
        user_id: user.userId,
        status: ShiftStatus.OPEN,
      },
    });

    if (!openShift) {
      return res.status(400).json({ success: false, error: 'No open shift found.' });
    }

    const shift = await prisma.shiftSession.update({
      where: { id: openShift.id },
      data: {
        ending_cash,
        expected_cash,
        notes,
        status: ShiftStatus.CLOSED,
        end_time: new Date(),
      },
    });

    res.json({ success: true, data: shift });
  } catch (error) {
    console.error('Failed to close shift', error);
    res.status(500).json({ success: false, error: 'Failed to close shift' });
  }
});

export { router as shiftRoutes };
