import { listUsers } from '@/services/users';
import { pageQuery, type Query } from '@/lib/validation';
import { Pagination } from '@/components/pagination';
import { Filters } from '@/components/filters';
import { UserForm, DeleteUser } from '@/components/user-form';
export const dynamic = 'force-dynamic';
export default async function UsersPage({ searchParams }: { searchParams: Promise<Query> }) {
  const result = await listUsers(pageQuery(await searchParams));
  const { stats } = result;
  return <>
    <div className="page-heading"><div><h1>Users</h1><p>Manage users and their details.</p></div><UserForm /></div>
    <dl className="stats">
      <div><dt>Filtered users</dt><dd>{stats.count}</dd></div>
      <div><dt>Total salary</dt><dd>{stats.totalSalary}</dd></div>
      <div><dt>Average salary</dt><dd>{stats.averageSalary}</dd></div>
      <div><dt>Average seniority</dt><dd>{stats.averageSeniority.years}<small> years </small>{stats.averageSeniority.months}<small> months</small></dd></div>
    </dl>
    <Filters />
    <div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th className="numeric">Salary</th><th>Start date</th><th>Actions</th></tr></thead><tbody>
      {result.items.map(user => <tr key={user.id}><td className="name">{user.name}</td><td>{user.email}</td><td><span className={`role ${user.role}`}>{user.role}</span></td><td className="numeric">{user.salary.toFixed(2)}</td><td>{user.startDate.toISOString().slice(0, 10)}</td><td><div className="row-actions"><UserForm user={{ ...user, salary: user.salary.toFixed(2), startDate: user.startDate.toISOString().slice(0, 10) }} /><DeleteUser id={user.id} name={user.name} /></div></td></tr>)}
      {!result.items.length && <tr><td colSpan={6} className="empty">No users found.</td></tr>}
    </tbody></table></div>
    <Pagination page={result.page} size={result.size} total={result.total} totalPages={result.totalPages} />
  </>;
}
