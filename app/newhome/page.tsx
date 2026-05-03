import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { listPosts, listProducts, mediaUrl, type BlsPost, type BlsProduct } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { firstImageUrl, fmtDate, postPath } from '@/lib/format';

export const revalidate = 60;

export default async function NewHomePage() {
  const [postsRes, productsRes] = await Promise.all([
    listPosts({ pageSize: 9 }).catch(() => null),
    listProducts({ sort: 'newest', pageSize: 8 }).catch(() => null),
  ]);

  const posts = postsRes?.data ?? [];
  const products = productsRes?.data ?? [];
  const [featured, ...latest] = posts;

  return (
    <div className="bg-[#fbf7f1] text-ink" data-testid="newhome-page">
      <NewHomeHero featured={featured} />
      <SectionRail />
      <LatestStories posts={latest} />
      <ProductSpotlight products={products} />
      <EditorialPromise />
    </div>
  );
}

function NewHomeHero({ featured }: { featured?: BlsPost }) {
  const img = featured ? mediaUrl(featured.coverImage ?? null) ?? firstImageUrl(featured.content) : null;
  const href = featured ? postPath(featured) : '/products';
  const category = featured?.categories?.[0];

  return (
    <section className="relative overflow-hidden px-4 py-5 sm:px-6 lg:px-8" data-testid="newhome-hero">
      <div className="mx-auto grid min-h-[78vh] max-w-7xl gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between rounded-[2rem] bg-white p-6 shadow-[0_24px_90px_rgba(17,17,17,0.06)] sm:p-9">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
              <p className="font-inter text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                {SITE.name}
              </p>
              <p className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
                Skincare journal
              </p>
            </div>

            <h1 className="mt-10 max-w-4xl font-display text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.88] tracking-tight text-ink">
              Skin care, made easier to choose.
            </h1>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <p className="hidden max-w-xs font-fraunces text-2xl italic leading-tight text-primary lg:block">
              Smart routines, honest reviews, and product edits for radiant skin.
            </p>
            <div>
              <p className="max-w-xl font-inter text-base font-light leading-8 text-ink/70 sm:text-lg">
                {SITE.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-full bg-ink px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary"
                >
                  Shop products
                </Link>
                <Link
                  href="/essential-guide-to-informative-articles"
                  className="inline-flex items-center rounded-full border border-ink/15 bg-[#fbf7f1] px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:border-primary hover:text-primary"
                >
                  Read articles
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Link href={href} className="group relative min-h-[540px] overflow-hidden rounded-[2rem] bg-ink text-white">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={featured?.coverImage?.alternativeText || featured?.title || 'Featured skincare article'}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/hero-banner-products.png"
              alt="Curated skincare products"
              className="absolute inset-0 h-full w-full object-contain opacity-85 mix-blend-screen"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" aria-hidden />
          <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
            <span className="rounded-full bg-white/90 px-4 py-2 font-inter text-xs font-semibold uppercase tracking-[0.22em] text-ink">
              Featured
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl text-ink transition group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            {category && (
              <p className="font-inter text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                {category.name}
              </p>
            )}
            <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              {featured?.title ?? 'Curated product guidance for every routine.'}
            </h2>
            <p className="mt-4 font-inter text-sm font-light text-white/70">
              {featured ? `${fmtDate(featured.publishedAt)} · ${featured.readingTimeMinutes ?? 5} min read` : 'Start with the latest product catalog'}
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}

function SectionRail() {
  return (
    <section className="border-y border-ink/10 bg-white" data-testid="newhome-sections">
      <div className="mx-auto grid max-w-7xl gap-0 px-6 lg:grid-cols-6">
        {SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`/${section.slug}`}
            className="group border-ink/10 py-6 transition hover:bg-[#fbf7f1] lg:border-l lg:px-5 first:lg:border-l-0"
          >
            <p className="font-inter text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {section.short}
            </p>
            <p className="mt-3 font-display text-xl font-bold leading-tight text-ink group-hover:text-primary">
              {section.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LatestStories({ posts }: { posts: BlsPost[] }) {
  return (
    <section className="bg-[#fbf7f1] px-4 py-16 sm:px-6 sm:py-20 lg:px-8" data-testid="newhome-latest">
      <div className="mx-auto max-w-7xl">
        <NewHomeHeader
          eyebrow="Latest journal"
          title="Fresh skincare reads"
          subtitle="New comparisons, reviews, and how-to guides from the editorial archive."
          href="/essential-guide-to-informative-articles"
        />
        <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.slice(0, 6).map((post) => (
            <StoryTile key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryTile({ post }: { post: BlsPost }) {
  const img = mediaUrl(post.coverImage ?? null) ?? firstImageUrl(post.content);
  const cat = post.categories?.[0];

  return (
    <article className="group flex h-full flex-col rounded-[1.5rem] bg-white p-3 shadow-[0_20px_70px_rgba(17,17,17,0.05)]">
      <Link href={postPath(post)} className="block overflow-hidden rounded-[1.2rem] bg-[#f1ebe2]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={post.coverImage?.alternativeText || post.title}
            className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-[16/10]" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        {cat && <p className="font-inter text-xs font-semibold uppercase tracking-[0.22em] text-primary">{cat.name}</p>}
        <Link href={postPath(post)}>
          <h6 className="mt-3 line-clamp-2 min-h-[1.4rem] font-display text-[8px] font-medium leading-snug text-ink transition group-hover:text-primary">
            {post.title}
          </h6>
        </Link>
        {post.excerpt && (
          <p className="mt-3 line-clamp-2 min-h-[3rem] text-sm font-light leading-6 text-ink/65">{post.excerpt}</p>
        )}
        <p className="mt-auto pt-4 text-xs text-ink/45">
          {fmtDate(post.publishedAt)} · {post.readingTimeMinutes ?? 5} min
        </p>
      </div>
    </article>
  );
}

function ProductSpotlight({ products }: { products: BlsProduct[] }) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8" data-testid="newhome-products">
      <div className="mx-auto max-w-7xl">
        <NewHomeHeader
          eyebrow="Product shelf"
          title="Recently added products"
          subtitle="A quick look at the newest skincare products in the catalog."
          href="/products"
        />
        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} variant="tile" thumbBg="bg-[#fbf7f1]" />
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialPromise() {
  return (
    <section className="bg-ink px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8" data-testid="newhome-promise">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <h2 className="font-display text-[clamp(2.4rem,6vw,6rem)] font-extrabold leading-[0.95] tracking-tight text-white">
          Built for clearer skincare decisions.
        </h2>
        <div>
          <p className="max-w-2xl font-inter text-base font-light leading-8 text-white/72 sm:text-lg">
            We compare, review, and explain skincare products so you can build a routine around your skin type, concerns, and budget.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/best-product-comparisons"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-primary hover:text-white"
            >
              Compare products
            </Link>
            <Link
              href="/skincare-how-to-guides"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-primary hover:text-primary"
            >
              Learn routines
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewHomeHeader({
  eyebrow,
  title,
  subtitle,
  href,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm font-light leading-7 text-ink/65 sm:text-base">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 py-2 font-inter text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-primary hover:text-primary"
      >
        View all <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
