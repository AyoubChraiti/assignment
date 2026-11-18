'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { pageSizes, type PageInfo } from '@/lib/pagination';

export function Pagination({ page, size, total, totalPages }: PageInfo) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function getPageUrl(nextPage: number, nextSize = size) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    params.set('size', String(nextSize));
    return `${pathname}?${params}`;
  }

  // Show the first page, last page, and neighbors of the current page.
  const candidates = [1, page - 1, page, page + 1, totalPages];
  const visiblePages = [...new Set(candidates)]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((a, b) => a - b);

  const firstResult = (page - 1) * size + 1;
  const lastResult = Math.min(page * size, total);

  return (
    <nav aria-label="Pagination" className="pagination">
      <span>
        {total === 0 ? '0 results' : `${firstResult}–${lastResult} of ${total}`}
      </span>

      <div className="page-links">
        {page > 1 && <Link href={getPageUrl(page - 1)}>Previous</Link>}

        {visiblePages.map((number, index) => {
          const hasGap = index > 0 && number - visiblePages[index - 1] > 1;
          return (
            <span key={number}>
              {hasGap && <span className="gap">…</span>}
              <Link
                href={getPageUrl(number)}
                aria-label={`Page ${number}`}
                aria-current={number === page ? 'page' : undefined}
              >
                {number}
              </Link>
            </span>
          );
        })}

        {page < totalPages && <Link href={getPageUrl(page + 1)}>Next</Link>}
      </div>

      <label>
        Per page
        <select
          value={size}
          onChange={(event) =>
            router.push(getPageUrl(1, Number(event.target.value)))
          }
        >
          {pageSizes.map((pageSize) => (
            <option key={pageSize}>{pageSize}</option>
          ))}
        </select>
      </label>
    </nav>
  );
}
