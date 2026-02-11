import { Router } from 'express';
import { contactUs, userStats } from './miscellaneous.controller';
import { authorizeRoles, isLoggedIn } from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate.middleware';
import { contactUsSchema } from './miscellaneous.schema';

const router = Router();

router.route('/contact').post(validate(contactUsSchema), contactUs);
router.route('/admin/stats/users').get(isLoggedIn, authorizeRoles('ADMIN'), userStats);

export default router;
