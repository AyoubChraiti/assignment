import Decimal from 'decimal.js';

export type StatsInput = { count: number; totalSalary: string; totalSeniorityMonths: string };
export function completedMonths(start: Date, today: Date): number {
  const months = (today.getUTCFullYear() - start.getUTCFullYear()) * 12 + today.getUTCMonth() - start.getUTCMonth();
  return Math.max(0, months - (today.getUTCDate() < start.getUTCDate() ? 1 : 0));
}
// Inputs are database aggregates, so this never needs every user in memory.
export function calculateStats({ count, totalSalary, totalSeniorityMonths }: StatsInput) {
  const total = new Decimal(totalSalary);
  const averageMonths = count ? new Decimal(totalSeniorityMonths).div(count).floor().toNumber() : 0;
  return {
    count,
    totalSalary: total.toFixed(2, Decimal.ROUND_HALF_UP),
    averageSalary: (count ? total.div(count) : new Decimal(0)).toFixed(2, Decimal.ROUND_HALF_UP),
    averageSeniority: { years: Math.floor(averageMonths / 12), months: averageMonths % 12 },
  };
}
