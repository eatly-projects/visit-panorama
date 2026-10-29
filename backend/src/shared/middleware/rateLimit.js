/**
 * Pembatas jumlah permintaan per alamat IP untuk endpoint yang bisa
 * diakses tanpa login (form tamu terbuka untuk internet, PLANNING §17).
 *
 * Catatan: di Vercel setiap instance fungsi punya hitungannya sendiri, jadi
 * ini pengaman dasar, bukan pagar mutlak. Persetujuan tetap di tangan petugas.
 */

import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

function clientIp(req) {
  const forwarded = req.headers['x-real-ip'] ?? req.headers['x-forwarded-for']?.split(',')[0];
  return (forwarded ?? req.ip ?? '').trim();
}

function limiter({ windowMinutes, limit, ...rest }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.' },
    ...rest,
  });
}

// Pencarian karyawan/perusahaan sambil mengetik.
export const publicReadLimit = limiter({ windowMinutes: 1, limit: 120 });

// Kirim form dan tambah perusahaan. Dibuat cukup longgar karena satu
// rombongan bisa memakai wifi kantor yang sama (IP sama).
export const publicWriteLimit = limiter({ windowMinutes: 10, limit: 40 });

// Percobaan login gagal.
export const loginLimit = limiter({ windowMinutes: 15, limit: 10, skipSuccessfulRequests: true });
