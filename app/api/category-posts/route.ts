import { NextRequest, NextResponse } from 'next/server';
import { listPosts } from '@/lib/strapi';

// Must match PAGE_SIZE in app/[category]/page.tsx so paging is consistent.
const PAGE_SIZE = 12;

/**
 * Feeds the client-side "Load More" on category pages. Returns the next page
 * of posts (already localized: images rewritten, dashes normalized) so the
 * grid can append in place without a full navigation.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category') || undefined;
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const sort = sp.get('sort') === 'oldest' ? 'oldest' : 'newest';

  const res = await listPosts({ category, page, pageSize: PAGE_SIZE }).catch(() => null);
  let posts = res?.data ?? [];
  // Match the page's per-page sort flip (listPosts is newest-first).
  if (sort === 'oldest') posts = [...posts].reverse();

  return NextResponse.json({
    posts,
    pageCount: res?.meta?.pagination?.pageCount ?? 1,
  });
}
