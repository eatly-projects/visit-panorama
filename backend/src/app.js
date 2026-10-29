import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './features/auth/auth.routes.js';
import { publicRouter } from './features/public/public.routes.js';
import { visitsRouter } from './features/visits/visits.routes.js';
import { employeesRouter } from './features/employees/employees.routes.js';
import { companiesRouter } from './features/companies/companies.routes.js';
import { officersRouter } from './features/officers/officers.routes.js';
import { requireAuth } from './shared/middleware/authMiddleware.js';
import { errorHandler, HttpError } from './shared/middleware/errorHandler.js';

dotenv.config({ quiet: true });

export const app = express();

app.set('trust proxy', true);

// Frontend normalnya memanggil lewat /api di domainnya sendiri (proxy),
// jadi CORS hanya dipakai kalau backend dipanggil langsung dari origin lain.
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/visits', requireAuth, visitsRouter);
app.use('/api/employees', requireAuth, employeesRouter);
app.use('/api/companies', requireAuth, companiesRouter);
app.use('/api/officers', requireAuth, officersRouter);

app.use('/api', (req, res, next) => next(new HttpError(404, 'Alamat tidak ditemukan')));

// Harus didaftarkan paling akhir.
app.use(errorHandler);

export default app;
