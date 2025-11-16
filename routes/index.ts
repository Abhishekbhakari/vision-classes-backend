import { Router } from 'express';
import userRouter from '../api/users/user.routes.js';
import courseRouter from '../api/courses/course.router.js';
import paymentRouter from '../api/payments/payment.routes.js';
import contactRouter from '../api/contact/contact.routes.js';
import statsRouter from '../api/stats/stats.router.js';

const allRoutes = Router();

// Mount all module routers
allRoutes.use('/user', userRouter);
allRoutes.use('/courses', courseRouter);
allRoutes.use('/payments', paymentRouter);
allRoutes.use('/contact', contactRouter);        // ADD this
allRoutes.use('/admin/stats', statsRouter); // ADD this

export default allRoutes;