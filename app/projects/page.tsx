import { db } from '@/lib/db';
import { paginate } from '@/lib/pagination';
import { pageQuery, type Query } from '@/lib/validation';
import { Pagination } from '@/components/pagination';
import { Filters } from '@/components/filters';
export const dynamic = 'force-dynamic';
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = pageQuery(await searchParams);
  const where = { name: { contains: query.q.replace(/[\\%_]/g, '\\$&'), mode: 'insensitive' as const } };
  const result = await paginate({ count: () => db.project.count({ where }), findMany: args => db.project.findMany({ where, ...args, orderBy: { id: 'asc' } }) }, query.page, query.size);
  return <><div className="page-heading"><div><h1>Projects</h1><p>Browse projects.</p></div></div><Filters /><div className="table-scroll"><table><thead><tr><th>ID</th><th>Project name</th></tr></thead><tbody>{result.items.map(p => <tr key={p.id}><td>{p.id}</td><td className="name">{p.name}</td></tr>)}{!result.items.length && <tr><td colSpan={2} className="empty">No projects found.</td></tr>}</tbody></table></div><Pagination page={result.page} size={result.size} total={result.total} totalPages={result.totalPages} /></>;
}
