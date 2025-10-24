import { Router } from 'express';

// Import all modular routers
import { authRouter } from './modules/auth/auth.router';

export const mainRouter = Router();

// Mount all modular routers
mainRouter.use('/', authRouter);

