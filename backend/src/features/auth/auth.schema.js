import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string('Email wajib diisi').trim().min(1, 'Email wajib diisi'),
  password: z.string('Password wajib diisi').min(1, 'Password wajib diisi'),
});
