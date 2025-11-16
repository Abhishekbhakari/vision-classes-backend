import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { statsService } from './stats.servics.js';
import { HttpCode } from '../../constants/httpCode.js';

class StatsController {
  public getUserStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await statsService.getUserStats();

    res.status(HttpCode.OK).json({
      success: true,
      message: 'User stats retrieved',
      stats,
    });
  });
}

export const statsController = new StatsController();