import { Router } from 'express';
import { list, create, update } from './officers.controller.js';
import { asyncHandler } from '../../shared/middleware/errorHandler.js';

export const officersRouter = Router();

officersRouter.get('/', asyncHandler(list));
officersRouter.post('/', asyncHandler(create));
officersRouter.patch('/:id', asyncHandler(update));
