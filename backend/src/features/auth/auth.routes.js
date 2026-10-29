import { Router } from 'express';
import { login, me, logout } from './auth.controller.js';
import { requireAuth } from '../../shared/middleware/authMiddleware.js';
import { asyncHandler } from '../../shared/middleware/errorHandler.js';
import { loginLimit } from '../../shared/middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/login', loginLimit, asyncHandler(login));
authRouter.get('/me', requireAuth, me);
authRouter.post('/logout', logout);
