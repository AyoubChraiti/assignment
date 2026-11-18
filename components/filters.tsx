'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function Filters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlQuery = searchParams.get('q') ?? '';
  const urlRole = searchParams.get('role');
  const selectedRole =
    urlRole === 'admin' || urlRole === 'member' ? urlRole : '';
  const [query, setQuery] = useState(urlQuery);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Keep the input in sync when the URL changes, including browser Back.
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    return () => clearTimeout(searchTimer.current);
  }, []);

  function updateFilters(name: string, role: string) {
    const params = new URLSearchParams(searchParams);

    if (name) params.set('q', name);
    else params.delete('q');

    if (role) params.set('role', role);
    else params.delete('role');

    params.set('page', '1');
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => updateFilters(value, selectedRole),
      300,
    );
  }

  function handleRoleChange(role: string) {
    clearTimeout(searchTimer.current);
    updateFilters(query, role);
  }

  return (
    <div className="filters">
      <label className="search">
        Search by name
        <input
          type="search"
          placeholder="Search by name…"
          maxLength={100}
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </label>

      <label>
        Role
        <select
          value={selectedRole}
          onChange={(event) => handleRoleChange(event.target.value)}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </label>
    </div>
  );
}
