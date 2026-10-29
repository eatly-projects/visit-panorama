import { z } from 'zod';
import { normalizePhone } from '../../shared/utils/phone.js';
import { isoDate } from '../../shared/utils/schemas.js';

export const STATUSES = ['menunggu', 'berkunjung', 'selesai', 'ditolak', 'tidak_kembali'];

export const formSchema = z.object({
  visitor_name: z.string('Nama wajib diisi').trim().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  phone: z
    .string('Nomor telepon wajib diisi')
    .transform((v) => normalizePhone(v))
    .refine((v) => v !== null, 'Nomor telepon tidak valid. Contoh: 0812 3456 7890'),
  // Arahan atasan (29 Oktober 2026): perusahaan/asal dan tujuan kunjungan
  // wajib; alamat tidak diminta karena termasuk data pribadi.
  company_id: z.uuid('Pilih atau tambahkan perusahaan atau asal Anda'),
  employee_id: z.uuid('Pilih orang yang ingin ditemui'),
  purpose: z
    .string('Tujuan kunjungan wajib diisi')
    .trim()
    .min(1, 'Tujuan kunjungan wajib diisi')
    .max(1000, 'Tujuan kunjungan maksimal 1000 karakter'),
  consent: z.literal(true, 'Centang persetujuan terlebih dahulu'),
});

export const approveSchema = z.object({
  card_number: z.coerce
    .number('Nomor kartu visitor wajib diisi')
    .int('Nomor kartu visitor harus berupa angka bulat')
    .min(1, 'Nomor kartu visitor wajib diisi dan lebih dari 0')
    .max(999999, 'Nomor kartu visitor terlalu besar'),
});

const empty = (v) => (v === '' ? undefined : v);

export const filterSchema = z.object({
  q: z.preprocess(empty, z.string().trim().max(100).optional()),
  phone: z.preprocess(
    empty,
    z.string().transform((v) => normalizePhone(v)).refine((v) => v !== null, 'Nomor telepon tamu tidak valid').optional()
  ),
  from: z.preprocess(empty, isoDate.optional()),
  to: z.preprocess(empty, isoDate.optional()),
  status: z.preprocess(empty, z.enum(STATUSES, 'Status tidak dikenal').optional()),
  company_id: z.preprocess(empty, z.uuid('Perusahaan tidak ditemukan').optional()),
  employee_id: z.preprocess(empty, z.uuid('Karyawan tidak ditemukan').optional()),
});
