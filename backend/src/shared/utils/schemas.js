import { z } from 'zod';

export const idParam = z.object({ id: z.uuid('Data tidak ditemukan') });

export const pageQuery = z.coerce.number().int().min(1).catch(1);

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid');
