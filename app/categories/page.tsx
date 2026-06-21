import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { listProductCategories, mediaUrl } from '@/lib/strapi';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Product Categories',
  description: `Browse skincare product categories at ${SITE.name}.`,
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const categories = (await listProductCategories().catch(() => []))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));

  return (
    <section className="bg-paper py-12 sm:py-16" data-testid="categories-page">
      <div className="mx-auto max-w-7xl px-6">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Categories</p>
          <h1 className="mt-3 font-display font-bold tracking-tight text-ink">Product Categories</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg">
            Browse skincare by category and compare prices across merchants.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center text-ink/55">
            <p className="text-base">No product categories are available yet.</p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const image = mediaUrl(c.image ?? null);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-ink/10 transition hover:ring-primary/40"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={c.name} className="h-full w-full object-contain p-1.5" />
                      ) : (
                        <span className="text-xl">{c.icon ?? '🧴'}</span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display font-semibold text-ink">{c.name}</span>
                      {c.description && (
                        <span className="mt-0.5 line-clamp-1 block text-sm text-ink/60">{c.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
