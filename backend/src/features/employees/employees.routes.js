import { Router } from 'express';
import { list, create, update } from './employees.controller.js';
import { asyncHandler } from '../../shared/middleware/errorHandler.js';

export const employeesRouter = Router();

employeesRouter.get('/', asyncHandler(list));
employeesRouter.post('/', asyncHandler(create));
employeesRouter.patch('/:id', asyncHandler(update));
