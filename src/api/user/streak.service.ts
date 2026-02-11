import AppError from '../../utils/AppError';
import User, { IUser } from '../../models/user.model';

export const updateUserStreak = async (userId : string) : Promise<IUser> => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const now = new Date();
    const lastLogin = user.streak.lastLogin ? new Date(user.streak.lastLogin) : null;

    //Date comparision

    const getDateOnly = (date : Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    const today = getDateOnly(now);
    const lastLoginDate = lastLogin ? getDateOnly(lastLogin) : null;

    //first time

    if(!lastLoginDate){
        user.streak.current = 1;
        user.streak.lastLogin = now;
        await user.save();
        return user;
    }

    if (lastLoginDate.getTime() === today.getTime()) {
        return user;
    }

    //consecutive day

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (lastLoginDate.getTime() === yesterday.getTime()) {
        user.streak.current += 1;

    } else {
        user.streak.current = 1;
    }

    user.streak.lastLogin = now;
    await user.save();
    return user;
    
};

export const getStreakInfo = async (userId:string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return {
        current : user.streak.current,
        lastLogin:user.streak.lastLogin
    };
};