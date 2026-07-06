'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <input
        type="text"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-bg-card border border-white/10 text-text-primary pl-10 pr-4 py-2 rounded-full text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple transition-all duration-200"
      />
      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
    </form>
  );
}
