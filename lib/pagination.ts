import { z } from 'zod';
export const pageSizes = [10, 20, 50] as const;
export const pageSchema = z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).catch(1);
export const sizeSchema = z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(50)])).catch(10);
export type PageInfo = { page: number; size: number; total: number; totalPages: number };
export async function paginate<T>(
  source: { count: () => Promise<number>; findMany: (args: { skip: number; take: number }) => Promise<T[]> },
  requestedPage: unknown = 1, requestedSize: unknown = 10,
): Promise<PageInfo & { items: T[] }> {
  const size = sizeSchema.parse(requestedSize);
  const requested = pageSchema.parse(requestedPage);
  const total = await source.count();
  const totalPages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(requested, totalPages);
  const items = await source.findMany({ skip: (page - 1) * size, take: size });
  return { items, page, size, total, totalPages };
}
