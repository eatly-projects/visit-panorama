import { verifyToken, findActiveOfficerById } from '../../features/auth/auth.service.js';
import { HttpError } from './errorHandler.js';

export const AUTH_COOKIE_NAME = 'panorama_session';

async function officerFromRequest(req) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return null;
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }
  // Dicek ulang ke database setiap request, supaya akun yang baru
  // dinonaktifkan langsung tidak bisa dipakai walau tokennya masih berlaku.
  return findActiveOfficerById(payload.sub);
}

/** Wajib login. Menaruh petugas yang login di req.officer. */
export async function requireAuth(req, res, next) {
  try {
    const officer = await officerFromRequest(req);
    if (!officer) {
      return next(new HttpError(401, 'Sesi Anda sudah berakhir. Silakan masuk kembali.'));
    }
    req.officer = officer;
    next();
  } catch (err) {
    next(err);
  }
}

/** Tidak wajib login, tapi kalau petugas sedang login, req.officer diisi. */
export async function optionalAuth(req, res, next) {
  try {
    req.officer = await officerFromRequest(req);
    next();
  } catch (err) {
    next(err);
  }
}
