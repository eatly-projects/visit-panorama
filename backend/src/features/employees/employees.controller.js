import { z } from 'zod';
import * as service from './employees.service.js';
import { parse } from '../../shared/middleware/errorHandler.js';
import { idParam, pageQuery } from '../../shared/utils/schemas.js';

const name = z.string('Nama karyawan wajib diisi').trim().min(1, 'Nama karyawan wajib diisi').max(100, 'Nama karyawan maksimal 100 karakter');
// Arahan atasan (29 Oktober 2026): tamu memilih "nama karyawan dan
// departemen/bagian", jadi departemen wajib diisi.
const department = z
  .string('Departemen atau bagian wajib diisi')
  .trim()
  .min(1, 'Departemen atau bagian wajib diisi')
  .max(100, 'Departemen atau bagian maksimal 100 karakter');

const createSchema = z.object({ name, department });
// Field yang tidak dikirim dibiarkan undefined supaya tidak ikut diubah.
const updateSchema = z.object({
  name: name.optional(),
  department: department.optional(),
  is_active: z.boolean().optional(),
});

export async function list(req, res) {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const status = ['aktif', 'nonaktif'].includes(req.query.status) ? req.query.status : 'semua';
  res.json(await service.list({ q, status, page: pageQuery.parse(req.query.page) }));
}

export async function create(req, res) {
  res.status(201).json(await service.create(parse(createSchema, req.body)));
}

export async function update(req, res) {
  const { id } = parse(idParam, req.params);
  res.json(await service.update(id, parse(updateSchema, req.body ?? {})));
}
