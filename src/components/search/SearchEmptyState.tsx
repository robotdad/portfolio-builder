'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Search className="w-16 h-16 text-[var(--color-text-muted)] mb-6" />
      
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
        No results found for &ldquo;{query}&rdquo;
      </h2>
      
      <div className="text-left mb-8 max-w-md">
        <p className="text-[var(--color-text-secondary)] mb-4">Try:</p>
        <ul className="text-sm text-[var(--color-text-secondary)] space-y-2">
          <li>• Different keywords</li>
          <li>• Project names</li>
          <li>• Image descriptions</li>
        </ul>
      </div>
      
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-accent-contrast,white)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Browse All Projects
        </Link>
        <Link
          href="/#categories"
          className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          View Categories
        </Link>
      </div>
    </div>
  );
}
