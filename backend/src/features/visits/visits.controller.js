import * as service from './visits.service.js';
import { approveSchema, filterSchema } from './visits.schema.js';
import { parse } from '../../shared/middleware/errorHandler.js';
import { idParam, pageQuery } from '../../shared/utils/schemas.js';

export async function summary(req, res) {
  res.json(await service.summary());
}

const queryText = (req) => (typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : '');

export async function pending(req, res) {
  res.json(await service.pending({ q: queryText(req), page: pageQuery.parse(req.query.page) }));
}

export async function active(req, res) {
  res.json(await service.active({ q: queryText(req), page: pageQuery.parse(req.query.page) }));
}

export async function list(req, res) {
  const filters = parse(filterSchema, req.query);
  res.json(await service.list(filters, pageQuery.parse(req.query.page)));
}

export async function detail(req, res) {
  const { id } = parse(idParam, req.params);
  res.json(await service.findById(id));
}

export async function approve(req, res) {
  const { id } = parse(idParam, req.params);
  const { card_number } = parse(approveSchema, req.body);
  res.json(await service.approve(id, card_number, req.officer.id));
}

/** Membuat handler untuk perubahan status sederhana (Tolak, Kartu dikembalikan, Kartu tidak kembali). */
export const transition = (action) => async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.transition(action, id, req.officer.id));
};

export async function deletePreview(req, res) {
  res.json(await service.deletePreview(parse(filterSchema, req.query)));
}

export async function deleteByFilter(req, res) {
  res.json(await service.deleteByFilter(parse(filterSchema, req.body ?? {})));
}

export async function remove(req, res) {
  const { id } = parse(idParam, req.params);
  await service.remove(id);
  res.status(204).end();
}
