import { Router } from 'express';

// Import all modular routers
import { avatarRouter } from './modules/avatar/avatar.router';
import { invitationRouter } from './modules/invitation/invitation.router';
import { namespaceRouter } from './modules/namespace/namespace.router';
import { ownerRouter } from './modules/owners/owners.router';
import { paymentEventRouter } from './modules/payment-event/payment-event.router';
import { profileRouter } from './modules/profile/profile.router';
import { settleRouter } from './modules/settle/settle.router';
import { uploadRouter } from './modules/upload/upload.router';
import { userRouter } from './modules/user/user.router';
import { authRouter } from './modules/auth/auth.router';

export const mainRouter = Router();

// Mount all modular routers
mainRouter.use('/', authRouter);
mainRouter.use('/', avatarRouter);
mainRouter.use('/', invitationRouter);
mainRouter.use('/', namespaceRouter);
mainRouter.use('/', ownerRouter);
mainRouter.use('/', paymentEventRouter);
mainRouter.use('/', profileRouter);
mainRouter.use('/', settleRouter);
mainRouter.use('/', uploadRouter);
mainRouter.use('/', userRouter);

