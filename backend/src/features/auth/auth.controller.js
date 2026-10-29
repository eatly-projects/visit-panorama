import { loginSchema } from './auth.schema.js';
import { findOfficerByEmail, verifyPassword, issueToken, TOKEN_TTL_HOURS } from './auth.service.js';
import { HttpError, parse } from '../../shared/middleware/errorHandler.js';
import { AUTH_COOKIE_NAME } from '../../shared/middleware/authMiddleware.js';

// Frontend memanggil backend lewat path relatif /api (Vite proxy saat dev,
// rewrite Vercel saat produksi), jadi cookie ini selalu cookie pihak pertama
// dan cukup SameSite=Lax. Tidak perlu SameSite=None yang ditolak Safari.
const IS_DEPLOYED = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const AUTH_COOKIE_OPTIONS = { httpOnly: true, secure: IS_DEPLOYED, sameSite: 'lax', path: '/' };

export async function login(req, res) {
  const { email, password } = parse(loginSchema, req.body);

  const officer = await findOfficerByEmail(email);
  // Pesan yang sama untuk email tidak terdaftar dan password salah.
  if (!officer || !officer.is_active || !(await verifyPassword(password, officer.password_hash))) {
    throw new HttpError(401, 'Email atau password salah');
  }

  res.cookie(AUTH_COOKIE_NAME, issueToken(officer), {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: TOKEN_TTL_HOURS * 60 * 60 * 1000,
  });
  res.json({ id: officer.id, name: officer.name, email: officer.email });
}

export function me(req, res) {
  res.json(req.officer);
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  res.status(204).end();
}
