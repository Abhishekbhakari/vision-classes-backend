import User, { IUser } from '../../models/user.model';
import AppError from '../../utils/AppError';
interface GoalTemplate {
    id: string;
    text: string;
    xpReward: number;
}
const GOAL_TEMPLATES: GoalTemplate[] = [
    { id: 'lecture_1', text: 'Complete 1 lecture', xpReward: 50 },
    { id: 'quiz_80', text: 'Score 80% on a quiz', xpReward: 75 },
    { id: 'study_30', text: 'Study for 30 minutes', xpReward: 60 },
    { id: 'homework_1', text: 'Submit 1 homework', xpReward: 55 },
];
export const resetDailyGoalsIfNeeded = async (userId: string): Promise<IUser> => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const now = new Date();
    const needsReset = user.dailyGoals.length === 0 || isNewDay(user.dailyGoals[0].createdAt, now);

    if (needsReset) {
        // Select 2-3 random goals
        const selectedGoals = selectRandomGoals(GOAL_TEMPLATES, 3);

        user.dailyGoals = selectedGoals.map(template => ({
            id: `${template.id}_${Date.now()}`, // Unique ID per day
            text: template.text,
            isCompleted: false,
            xpReward: template.xpReward,
            createdAt: now
        }));

        await user.save();
    }

    return user;
};
export const completeGoal = async (userId: string, goalId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const goal = user.dailyGoals.find(g => g.id === goalId);
    if (!goal) throw new AppError('Goal not found', 404);
    if (goal.isCompleted) throw new AppError('Goal already completed', 400);

    // Mark complete
    goal.isCompleted = true;
    user.xp += goal.xpReward;

    // Check if all goals complete for bonus
    const allComplete = user.dailyGoals.every(g => g.isCompleted);
    if (allComplete) {
        user.xp += 100; // Bonus XP
    }

    await user.save();

    return {
        user,
        xpGained: goal.xpReward + (allComplete ? 100 : 0),
        allGoalsComplete: allComplete
    };
};
// Helpers
function isNewDay(oldDate: Date, newDate: Date): boolean {
    const old = new Date(oldDate);
    const now = new Date(newDate);
    old.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return old.getTime() !== now.getTime();
}
function selectRandomGoals(templates: GoalTemplate[], count: number): GoalTemplate[] {
    const shuffled = [...templates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}