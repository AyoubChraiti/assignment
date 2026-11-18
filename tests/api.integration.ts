import { test } from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const request = (path: string, method = 'GET', data?: unknown) => fetch(`${base}/api/users${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}) });
test('user API: CRUD, validation, pagination, 404 and 409', async () => {
  const user = { name: `API Test ${crypto.randomUUID()} %_`, email: `test-${crypto.randomUUID()}@example.com`, role: 'admin', salary: '1234.55', startDate: '2020-01-15' };
  let id: string | undefined;
  try {
    assert.equal((await request('', 'POST', { ...user, salary: 1234.55 })).status, 400);
    assert.equal((await request('/not-an-id')).status, 400);
    assert.equal((await request('?role=invalid')).status, 400);
    const created = await request('', 'POST', user); assert.equal(created.status, 201);
    const body = await created.json(); id = body.id; assert.equal(typeof body.salary, 'string');
    assert.equal((await request('', 'POST', user)).status, 409);
    const read = await request(`/${id}`); assert.equal(read.status, 200); assert.equal((await read.json()).name, user.name);
    const updated = await request(`/${id}`, 'PATCH', { name: `${user.name} updated`, salary: '0.21' }); assert.equal(updated.status, 200); assert.equal((await updated.json()).salary, '0.21');
    assert.equal((await request(`/${id}`, 'PATCH', {})).status, 400);
    const list = await request(`?q=${encodeURIComponent(user.name)}&role=admin&page=999&size=10`); assert.equal(list.status, 200);
    const page = await list.json(); assert.equal(page.page, 1); assert.equal(page.total, 1); assert.equal(page.stats.totalSalary, '0.21'); assert.equal(page.stats.averageSalary, '0.21');
    const invalidPage = await request('?page=abc'); assert.equal(invalidPage.status, 200); assert.equal((await invalidPage.json()).page, 1);
    const invalidJson = await fetch(`${base}/api/users`, { method: 'POST', body: '{', headers: { 'Content-Type': 'application/json' } }); assert.equal(invalidJson.status, 400);
    assert.equal((await request(`/${id}`, 'DELETE')).status, 204);
    assert.equal((await request(`/${id}`)).status, 404);
    assert.equal((await request(`/${id}`, 'PATCH', { name: 'Gone' })).status, 404);
    assert.equal((await request(`/${id}`, 'DELETE')).status, 404);
  } finally { if (id) await request(`/${id}`, 'DELETE'); }
});
