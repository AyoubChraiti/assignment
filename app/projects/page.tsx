import { db } from '@/lib/db';
import { paginate } from '@/lib/pagination';
import { type Query } from '@/lib/validation';
import { Pagination } from '@/components/pagination';
export const dynamic = 'force-dynamic';
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { page, size } = await searchParams;
  const result = await paginate({
    count: () => db.project.count(),
    findMany: args => db.project.findMany({ ...args, orderBy: { id: 'asc' } }),
  }, page, size);
  return <><div className="page-heading"><div><h1>Projects</h1><p>Browse projects.</p></div></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Project name</th></tr></thead><tbody>{result.items.map(p => <tr key={p.id}><td>{p.id}</td><td className="name">{p.name}</td></tr>)}{!result.items.length && <tr><td colSpan={2} className="empty">No projects found.</td></tr>}</tbody></table></div><Pagination page={result.page} size={result.size} total={result.total} totalPages={result.totalPages} /></>;
}
