import User from '../../models/user.model';
import Course from '../../models/course.model';
import AppError from '../../utils/AppError';

export const markLectureComplete = async (userId: string, courseId: string, lectureId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    // Check if user has purchased the course
    const hasPurchased = user.purchasedCourses.some((id: any) => id.toString() === courseId);
    if (!hasPurchased) {
        throw new AppError('You must purchase this course first', 403);
    }

    // Find or create progress for this course
    let progress = user.courseProgress.find((p: any) => p.courseId.toString() === courseId);

    if (!progress) {
        user.courseProgress.push({
            courseId: courseId as any,
            completedLectures: [lectureId as any],
        });
    } else {
        // Check if lecture is already marked complete
        const alreadyCompleted = progress.completedLectures.some(
            (id: any) => id.toString() === lectureId
        );

        if (!alreadyCompleted) {
            progress.completedLectures.push(lectureId as any);

            // Award XP for completing the lecture
            const lecture = course.lectures.find((l: any) => l._id.toString() === lectureId);
            if (lecture && lecture.xpReward) {
                user.xp += lecture.xpReward;
                user.level = Math.floor(user.xp / 1000) + 1; // Simple level calculation
            }
        }
    }

    await user.save();
    return user.courseProgress;
};

export const getProgress = async (userId: string, courseId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const progress = user.courseProgress.find((p: any) => p.courseId.toString() === courseId);

    if (!progress) {
        return {
            courseId,
            completedLectures: [],
            totalLectures: 0,
            completionPercentage: 0,
        };
    }

    const course = await Course.findById(courseId);
    const totalLectures = course?.numberOfLectures || 0;
    const completedCount = progress.completedLectures.length;
    const completionPercentage = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0;

    return {
        courseId,
        completedLectures: progress.completedLectures,
        totalLectures,
        completionPercentage: Math.round(completionPercentage),
    };
};
