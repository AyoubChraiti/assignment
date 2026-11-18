'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { pageSizes, type PageInfo } from '@/lib/pagination';
export function Pagination({ page, size, total, totalPages }: PageInfo) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  function url(nextPage: number, nextSize = size) {
    const params = new URLSearchParams(search);
    params.set('page', String(nextPage)); params.set('size', String(nextSize));
    return `${pathname}?${params}`;
  }
  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages])).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return <nav aria-label="Pagination" className="pagination">
    <span>{total === 0 ? '0 results' : `${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}`}</span>
    <div className="page-links">
      {page > 1 && <Link href={url(page - 1)}>Previous</Link>}
      {pages.map((p, i) => <span key={p}>{i > 0 && p - pages[i - 1] > 1 && <span className="gap">…</span>}<Link aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} href={url(p)}>{p}</Link></span>)}
      {page < totalPages && <Link href={url(page + 1)}>Next</Link>}
    </div>
    <label>Per page <select value={size} onChange={e => router.push(url(1, Number(e.target.value)))}>{pageSizes.map(n => <option key={n}>{n}</option>)}</select></label>
  </nav>;
}
