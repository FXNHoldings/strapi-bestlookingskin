import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { listProductBrands, listProducts, mediaUrl } from '@/lib/strapi';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

async function getBrand(slug: string) {
  const brands = await listProductBrands().catch(() => []);
  return brands.find((b) => b.slug === slug) ?? null;
}

export async function generateStaticParams() {
  const brands = await listProductBrands().catch(() => []);
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: 'Brand not found' };
  const description =
    brand.description || `Shop ${brand.name} skincare products and compare prices at ${SITE.name}.`;
  return {
    title: `${brand.name} — Products & Prices`,
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: { title: brand.name, description, url: `${SITE.url}/brands/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const products = (await listProducts({ brand: slug, pageSize: 48 }).catch(() => null))?.data ?? [];
  const logo = mediaUrl(brand.logo ?? null);

  return (
    <section className="bg-paper py-12 sm:py-16" data-testid={`brand-${brand.slug}`}>
      <div className="mx-auto max-w-7xl px-6">
        <nav className="text-sm text-ink/55" aria-label="Breadcrumb">
          <Link href="/brands" className="hover:text-primary">Brands</Link>
          <span className="px-1.5">/</span>
          <span className="text-ink/75">{brand.name}</span>
        </nav>

        <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={`${brand.name} logo`}
              className="h-16 w-16 shrink-0 rounded-lg bg-white object-contain p-2 ring-1 ring-ink/10"
            />
          )}
          <div>
            <h1 className="font-display font-bold tracking-tight text-ink">{brand.name}</h1>
            {brand.websiteUrl && (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
              >
                Visit official site &rarr;
              </a>
            )}
          </div>
        </header>

        {brand.description && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">{brand.description}</p>
        )}

        <h2 className="mt-10 font-display text-xl font-bold text-ink">
          {products.length > 0
            ? `${products.length} ${products.length === 1 ? 'product' : 'products'}`
            : 'Products'}
        </h2>
        {products.length > 0 ? (
          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="tile" />
            ))}
          </div>
        ) : (
          <p className="mt-6 italic text-ink/50">No products yet for this brand.</p>
        )}
      </div>
    </section>
  );
}
