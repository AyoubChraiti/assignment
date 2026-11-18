import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { paginate } from '@/lib/pagination';
import { calculateStats } from '@/lib/stats';
import {
  idSchema,
  listSchema,
  userSchema,
  updateUserSchema,
} from '@/lib/validation';

export async function listUsers(input: unknown) {
  const query = listSchema.parse(input);
  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.q
      ? {
          name: {
            contains: query.q.replace(/[\\%_]/g, '\\$&'),
            mode: 'insensitive',
          },
        }
      : {}),
  };
  return db.$transaction(
    async (tx) => {
      const result = await paginate(
        {
          count: () => tx.user.count({ where }),
          findMany: (args) =>
            tx.user.findMany({
              where,
              ...args,
              orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            }),
        },
        query.page,
        query.size,
      );
      // Parameterized SQL aggregates salary and completed UTC months in PostgreSQL.
      // STRPOS uses literal substring matching, like the escaped Prisma contains above.
      const [aggregate] = await tx.$queryRaw<
        { totalSalary: Prisma.Decimal; totalMonths: Prisma.Decimal }[]
      >(Prisma.sql`
      SELECT COALESCE(SUM(salary), 0) AS "totalSalary",
        COALESCE(SUM(GREATEST(0,
          (EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date)::int - EXTRACT(YEAR FROM "startDate")::int) * 12
          + EXTRACT(MONTH FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date)::int - EXTRACT(MONTH FROM "startDate")::int
          - CASE WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date) < EXTRACT(DAY FROM "startDate") THEN 1 ELSE 0 END
        )), 0) AS "totalMonths"
      FROM "User"
      WHERE (${query.role ?? null}::text IS NULL OR role::text = ${query.role ?? null})
        AND STRPOS(LOWER(name), LOWER(${query.q})) > 0
    `);
      return {
        ...result,
        stats: calculateStats({
          count: result.total,
          totalSalary: aggregate.totalSalary.toString(),
          totalSeniorityMonths: aggregate.totalMonths.toString(),
        }),
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}
export function getUser(id: unknown) {
  return db.user.findUniqueOrThrow({ where: { id: idSchema.parse(id) } });
}
export function createUser(input: unknown) {
  const data = userSchema.parse(input);
  return db.user.create({
    data: { ...data, startDate: new Date(data.startDate) },
  });
}
export function updateUser(id: unknown, input: unknown) {
  const data = updateUserSchema.parse(input);
  return db.user.update({
    where: { id: idSchema.parse(id) },
    data: {
      ...data,
      ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    },
  });
}
export function deleteUser(id: unknown) {
  return db.user.delete({ where: { id: idSchema.parse(id) } });
}
