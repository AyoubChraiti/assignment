import { z } from 'zod';
import { pageSchema, sizeSchema } from './pagination';

export const userSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100),
  email: z.email('Enter a valid email.').trim().toLowerCase().max(254),
  role: z.enum(['admin', 'member']),
  salary: z.string().regex(/^(0|[1-9]\d{0,11})(\.\d{1,2})?$/, 'Use a positive amount with up to 2 decimal places.'),
  startDate: z.iso.date('Enter a valid date (YYYY-MM-DD).').refine(
    value => value <= new Date().toISOString().slice(0, 10), 'Start date cannot be in the future.'),
}).strict();
export const updateUserSchema = userSchema.partial().refine(value => Object.keys(value).length > 0, 'Provide at least one field.');
export const idSchema = z.uuid('Invalid user id.');
export const listSchema = z.object({
  page: pageSchema.default(1), size: sizeSchema.default(10),
  role: z.enum(['admin', 'member']).optional(),
  q: z.string().trim().max(100).default(''),
}).strict();
export type UserInput = z.infer<typeof userSchema>;
type ListInput = z.infer<typeof listSchema>;
export type Query = Record<string, string | string[] | undefined>;
// Pages recover from malformed URLs; API filters still return a validation error.
export function pageQuery(query: Query): ListInput {
  return listSchema.parse({
    page: query.page, size: query.size,
    role: query.role === 'admin' || query.role === 'member' ? query.role : undefined,
    q: typeof query.q === 'string' ? query.q.slice(0, 100) : '',
  });
}
