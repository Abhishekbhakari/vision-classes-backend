import User from '../users/user.model.js';
import AppError from '../../utils/appError.js';
import { HttpCode } from '../../constants/httpCode.js';

class StatsService {
  public async getUserStats(): Promise<{ allUsersCount: number; subscribedUsersCount: number }> {
    try {
      const allUsersCount = await User.countDocuments();
      const subscribedUsersCount = await User.countDocuments({
        'subscription.status': 'active',
      });

      return { allUsersCount, subscribedUsersCount };
    } catch (error: any) {
      throw new AppError(
        'Failed to fetch user stats.',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const statsService = new StatsService();