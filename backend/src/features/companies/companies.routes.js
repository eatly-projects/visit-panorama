import { Router } from 'express';
import { list, rename, merge, remove } from './companies.controller.js';
import { asyncHandler } from '../../shared/middleware/errorHandler.js';

export const companiesRouter = Router();

companiesRouter.get('/', asyncHandler(list));
companiesRouter.patch('/:id', asyncHandler(rename));
companiesRouter.post('/:id/merge', asyncHandler(merge));
companiesRouter.delete('/:id', asyncHandler(remove));
