'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
export function Filters() {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const urlQuery = search.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { setQuery(urlQuery); }, [urlQuery]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function update(q: string, role = search.get('role') ?? '') {
    const params = new URLSearchParams(search);
    q ? params.set('q', q) : params.delete('q');
    role ? params.set('role', role) : params.delete('role');
    params.set('page', '1');
    router.replace(`${pathname}?${params}`, { scroll: false });
  }
  return <div className="filters">
    <label className="search">Search by name<input type="search" placeholder="Search by name…" maxLength={100} value={query} onChange={e => {
      const value = e.target.value; setQuery(value); clearTimeout(timer.current);
      timer.current = setTimeout(() => update(value), 300);
    }} /></label>
    <label>Role<select value={search.get('role') === 'admin' ? 'admin' : search.get('role') === 'member' ? 'member' : ''} onChange={e => { clearTimeout(timer.current); update(query, e.target.value); }}><option value="">All roles</option><option value="admin">Admin</option><option value="member">Member</option></select></label>
  </div>;
}
