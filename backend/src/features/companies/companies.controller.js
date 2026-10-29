import { z } from 'zod';
import * as service from './companies.service.js';
import { parse } from '../../shared/middleware/errorHandler.js';
import { idParam, pageQuery } from '../../shared/utils/schemas.js';

const nameSchema = z.object({
  name: z.string('Nama perusahaan wajib diisi').trim().min(1, 'Nama perusahaan wajib diisi').max(150, 'Nama perusahaan maksimal 150 karakter'),
});

export async function list(req, res) {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  res.json(await service.listForOfficer({ q, page: pageQuery.parse(req.query.page) }));
}

export async function rename(req, res) {
  const { id } = parse(idParam, req.params);
  const { name } = parse(nameSchema, req.body);
  res.json(await service.rename(id, name));
}

export async function merge(req, res) {
  const { id } = parse(idParam, req.params);
  const { target_id } = parse(z.object({ target_id: z.uuid('Pilih perusahaan tujuan') }), req.body);
  res.json(await service.merge(id, target_id));
}

export async function remove(req, res) {
  const { id } = parse(idParam, req.params);
  await service.remove(id);
  res.status(204).end();
}
