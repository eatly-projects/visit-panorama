import { z } from 'zod';
import * as service from './officers.service.js';
import { parse } from '../../shared/middleware/errorHandler.js';
import { idParam, pageQuery } from '../../shared/utils/schemas.js';

const name = z.string('Nama wajib diisi').trim().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter');
const password = z.string('Password wajib diisi').min(8, 'Password minimal 8 karakter').max(72, 'Password maksimal 72 karakter');

const createSchema = z.object({
  name,
  email: z.email('Format email tidak valid'),
  password,
});

const updateSchema = z.object({
  name: name.optional(),
  password: password.optional(),
  is_active: z.boolean().optional(),
});

export async function list(req, res) {
  res.json(await service.list(pageQuery.parse(req.query.page)));
}

export async function create(req, res) {
  res.status(201).json(await service.create(parse(createSchema, req.body)));
}

export async function update(req, res) {
  const { id } = parse(idParam, req.params);
  res.json(await service.update(id, parse(updateSchema, req.body ?? {}), req.officer.id));
}
