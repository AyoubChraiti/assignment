import Decimal from 'decimal.js';

type StatsInput = { count: number; totalSalary: string; totalSeniorityMonths: string };
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
