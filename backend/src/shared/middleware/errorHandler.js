/**
 * Penanganan error terpusat. Controller cukup melempar HttpError (atau
 * reject), lalu errorHandler mengubahnya jadi respons JSON yang seragam.
 */

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Validasi dengan skema zod; melempar 400 berisi pesan pertama yang gagal. */
export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? 'Data yang dikirim tidak valid');
  }
  return result.data;
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Body JSON rusak dari express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Data yang dikirim tidak valid' });
  }
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status >= 500 ? 'Terjadi kesalahan di server. Silakan coba lagi sebentar lagi.' : err.message,
  });
}
