import { Router } from 'express';
import * as c from './visits.controller.js';
import { asyncHandler } from '../../shared/middleware/errorHandler.js';

export const visitsRouter = Router();

// Path tetap harus didaftarkan sebelum '/:id'.
visitsRouter.get('/summary', asyncHandler(c.summary));
visitsRouter.get('/stats', asyncHandler(c.stats));
visitsRouter.get('/export', asyncHandler(c.exportRows));
visitsRouter.get('/pending', asyncHandler(c.pending));
visitsRouter.get('/active', asyncHandler(c.active));
visitsRouter.get('/delete-preview', asyncHandler(c.deletePreview));
visitsRouter.post('/delete-by-filter', asyncHandler(c.deleteByFilter));
visitsRouter.get('/', asyncHandler(c.list));
visitsRouter.get('/:id', asyncHandler(c.detail));
visitsRouter.delete('/:id', asyncHandler(c.remove));
visitsRouter.post('/:id/approve', asyncHandler(c.approve));
visitsRouter.post('/:id/reject', asyncHandler(c.transition('reject')));
visitsRouter.post('/:id/return', asyncHandler(c.transition('return')));
visitsRouter.post('/:id/card-lost', asyncHandler(c.transition('cardLost')));
