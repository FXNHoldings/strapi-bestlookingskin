'use client';

import { useMemo, useState } from 'react';
import PostCard from '@/components/PostCard';
import type { BlsPost } from '@/lib/strapi';

/**
 * Category-page article list with:
 *  - a text filter (narrows the loaded posts by title),
 *  - a grid / list view toggle,
 *  - an in-place "Load More" button (appends pages from /api/category-posts).
 */
export default function LoadMoreArticles({
  category,
  initialPosts,
  initialPage,
  pageCount,
  sort,
}: {
  category: string;
  initialPosts: BlsPost[];
  initialPage: number;
  pageCount: number;
  sort: 'newest' | 'oldest';
}) {
  const [posts, setPosts] = useState<BlsPost[]>(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');

  const hasMore = page < pageCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => (p.title ?? '').toLowerCase().includes(q));
  }, [posts, query]);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const params = new URLSearchParams({ category, page: String(next), sort });
      const res = await fetch(`/api/category-posts?${params.toString()}`);
      const data = (await res.json()) as { posts: BlsPost[] };
      const seen = new Set(posts.map((p) => p.id));
      const fresh = (data.posts ?? []).filter((p) => !seen.has(p.id));
      setPosts((prev) => [...prev, ...fresh]);
      setPage(next);
    } catch {
      // Leave the button in place so the reader can retry.
    } finally {
      setLoading(false);
    }
  }

  const toggleBtn = (mode: 'grid' | 'list', label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setView(mode)}
      aria-pressed={view === mode}
      aria-label={`${label} view`}
      title={`${label} view`}
      className={
        'inline-flex h-8 w-8 items-center justify-center rounded transition ' +
        (view === mode ? 'bg-ink text-white' : 'text-ink/55 hover:text-ink')
      }
    >
      {icon}
    </button>
  );

  return (
    <>
      {/* Filter + view controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3" data-testid="article-controls">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter articles…"
          aria-label="Filter articles by title"
          className="w-full max-w-xs rounded-md border border-ink/15 px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-primary focus:outline-none"
        />
        <div className="inline-flex items-center gap-1 rounded-md border border-ink/15 p-0.5" role="group" aria-label="View mode">
          {toggleBtn(
            'grid',
            'Grid',
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>,
          )}
          {toggleBtn(
            'list',
            'List',
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="1" y="2" width="14" height="2.4" rx="1" />
              <rect x="1" y="6.8" width="14" height="2.4" rx="1" />
              <rect x="1" y="11.6" width="14" height="2.4" rx="1" />
            </svg>,
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-ink/55">
          {query ? `No articles match “${query}”.` : 'No posts here yet.'}
        </p>
      ) : view === 'grid' ? (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} variant="tile" />
          ))}
        </div>
      ) : (
        <div className="mt-6 divide-y divide-ink/10">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} variant="compact" />
          ))}
        </div>
      )}

      {hasMore && !query && (
        <nav className="mt-12 flex items-center justify-start text-sm" data-testid="pagination">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
            className="inline-flex items-center rounded-full border border-ink/15 px-6 py-2.5 font-medium text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
        </nav>
      )}
    </>
  );
}
