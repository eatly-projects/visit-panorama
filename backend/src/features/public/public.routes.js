/**
 * Endpoint tanpa login untuk form tamu (docs/PLANNING.md §12). Hanya empat,
 * dan tidak ada satu pun yang mengembalikan data tamu lain.
 */

import { Router } from 'express';
import { z } from 'zod';
import { searchPublic as searchEmployees } from '../employees/employees.service.js';
import { searchPublic as searchCompanies, createFromPublic } from '../companies/companies.service.js';
import { createFromForm } from '../visits/visits.service.js';
import { formSchema } from '../visits/visits.schema.js';
import { asyncHandler, parse } from '../../shared/middleware/errorHandler.js';
import { optionalAuth } from '../../shared/middleware/authMiddleware.js';
import { publicReadLimit, publicWriteLimit } from '../../shared/middleware/rateLimit.js';

export const publicRouter = Router();

const queryText = (req) => (typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : '');

const companySchema = z.object({
  name: z.string('Nama perusahaan wajib diisi').trim().min(1, 'Nama perusahaan wajib diisi').max(150, 'Nama perusahaan maksimal 150 karakter'),
  force: z.boolean().optional(),
});

publicRouter.get(
  '/employees',
  publicReadLimit,
  asyncHandler(async (req, res) => res.json(await searchEmployees(queryText(req))))
);

publicRouter.get(
  '/companies',
  publicReadLimit,
  asyncHandler(async (req, res) => res.json(await searchCompanies(queryText(req))))
);

publicRouter.post(
  '/companies',
  publicWriteLimit,
  asyncHandler(async (req, res) => res.json(await createFromPublic(parse(companySchema, req.body))))
);

// Kalau petugas yang sedang login mengisi form untuk tamu (tamu tanpa HP),
// namanya dicatat di filled_by sebagai bukti siapa yang mencentang persetujuan.
publicRouter.post(
  '/visits',
  publicWriteLimit,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const data = parse(formSchema, req.body);
    res.status(201).json(await createFromForm(data, req.officer?.id ?? null));
  })
);
