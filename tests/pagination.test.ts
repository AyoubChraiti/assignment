import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../lib/pagination';
function source(total: number) {
  return {
    count: async () => total,
    findMany: async ({ skip, take }: { skip: number; take: number }) =>
      Array.from(
        { length: Math.min(take, total - skip) },
        (_, i) => skip + i + 1,
      ),
  };
}
test('last page uses database skip/take and includes the remainder', async () => {
  const result = await paginate(source(23), 3, 10);
  assert.deepEqual(result.items, [21, 22, 23]);
  assert.equal(result.totalPages, 3);
});
test('out-of-range page clamps to last page', async () => {
  const result = await paginate(source(23), 999, 10);
  assert.equal(result.page, 3);
  assert.equal(result.items.length, 3);
});
test('bad page and size fall back safely', async () => {
  for (const page of ['abc', -1, 0, 'Infinity', '1e30', 1.2]) {
    const result = await paginate(source(23), page, 17);
    assert.equal(result.page, 1);
    assert.equal(result.size, 10);
  }
});
test('empty list has page 1', async () => {
  assert.deepEqual(await paginate(source(0), 999), {
    items: [],
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
  });
});
test('supports each required size', async () => {
  for (const size of [10, 20, 50])
    assert.equal((await paginate(source(100), 2, size)).items[0], size + 1);
});
