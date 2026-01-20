'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Search className="w-16 h-16 text-gray-300 mb-6" />
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        No results found
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        We couldn't find any projects, pages, or images matching{' '}
        <span className="font-semibold">"{query}"</span>
      </p>
      
      <div className="text-left mb-8 max-w-md">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Suggestions:
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Check your spelling</li>
          <li>• Try different keywords</li>
          <li>• Use fewer or more general words</li>
          <li>• Browse by category instead</li>
        </ul>
      </div>
      
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse All Projects
        </Link>
        <Link
          href="/#categories"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Categories
        </Link>
      </div>
    </div>
  );
}
