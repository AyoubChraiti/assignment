import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats } from '../lib/stats';
test('money rounds half-up without floating point', () => {
  const stats = calculateStats({ count: 2, totalSalary: '0.21', totalSeniorityMonths: '49' });
  assert.equal(stats.totalSalary, '0.21'); assert.equal(stats.averageSalary, '0.11');
  assert.deepEqual(stats.averageSeniority, { years: 2, months: 0 });
  assert.equal(calculateStats({ count: 1, totalSalary: '123456789012.345', totalSeniorityMonths: '0' }).totalSalary, '123456789012.35');
});
test('empty list produces zero statistics', () => { assert.deepEqual(calculateStats({ count: 0, totalSalary: '0', totalSeniorityMonths: '0' }), { count: 0, totalSalary: '0.00', averageSalary: '0.00', averageSeniority: { years: 0, months: 0 } }); });
