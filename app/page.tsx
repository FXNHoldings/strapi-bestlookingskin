import Link from 'next/link';
import { listPosts, listProducts, type BlsPost, type BlsProduct } from '@/lib/strapi';
import { SECTIONS, SITE } from '@/lib/site';
import { fmtDate, firstImageUrl, postPath } from '@/lib/format';
import PostCard from '@/components/PostCard';
import ArticlesCarousel from '@/components/ArticlesCarousel';
import ProductsCarousel from '@/components/ProductsCarousel';

export const revalidate = 60;

/* Homepage modeled on https://bestlooking.skin/ — same flow:
   1. Hero (welcome banner + tagline + intro)
   2. Product Selection Tools (4 cards: How-to / Top-Rated / Informative / Comparisons)
   3. Category Showcase (Moisturizer / Reviews / Serum / Eye Cream)
   4. Welcome intro
   5. Latest Arrivals (recent products carousel)
   6. Skincare-type sections (Moisturizer / Serum / Eye Cream / Anti-Aging) — show
      posts whose title or content mentions the term, since we don't yet have a
      product-type taxonomy
   7. Product Reviews — feature + grid pulled from reviews category
   8. Our Commitment (mission blurb)
   9. Articles (latest editorial)
   10. Contact strip                                                             */

const SKINCARE_TYPES: { label: string; query: string }[] = [
  { label: 'Moisturizer', query: 'moisturizer' },
  { label: 'Serum',       query: 'serum' },
  { label: 'Eye Cream',   query: 'eye cream' },
  { label: 'Anti-Aging',  query: 'anti-aging' },
];

const TOOLS: { title: string; href: string; blurb: string; emoji: string }[] = [
  { title: 'How-To Guides',         href: '/skincare-how-to-guides',                   blurb: 'Step-by-step routines and layering rules.',     emoji: '📖' },
  { title: 'Top-Rated Products',    href: '/top-rated-skincare-for-glowing-skin',      blurb: 'The standouts across cleansers, serums, SPF.',  emoji: '⭐' },
  { title: 'Informative Articles',  href: '/essential-guide-to-informative-articles',  blurb: 'Ingredients, skin types, the science behind it.', emoji: '🧪' },
  { title: 'Product Comparisons',   href: '/best-product-comparisons',                 blurb: 'Side-by-side breakdowns to pick a routine.',    emoji: '⚖️' },
];

const SHOWCASE: { label: string; href: string; img: string }[] = [
  {
    label: 'Moisturizer',
    href: '/search?q=moisturizer',
    img: '/showcase-moisturizer.jpg',
  },
  {
    label: 'Product Reviews',
    href: '/skincare-reviews-path-to-glowing-skin',
    img: '/showcase-reviews.jpg',
  },
  {
    label: 'Serum',
    href: '/search?q=serum',
    img: '/showcase-serum.jpg',
  },
  {
    label: 'Eye Cream',
    href: '/search?q=eye+cream',
    img: '/showcase-eyecream.jpg',
  },
];

export default async function HomePage() {
  // Fetch all editorial sections in parallel
  const perSection = await Promise.all(
    SECTIONS.map((s) =>
      listPosts({ category: s.slug, pageSize: 8 })
        .then((r) => r.data)
        .catch(() => [] as BlsPost[]),
    ),
  );
  const bySection: Record<string, BlsPost[]> = Object.fromEntries(
    SECTIONS.map((s, i) => [s.slug, perSection[i]]),
  );

  // Skincare-type sections — driven by full-text search of post bodies
  const perSkincareType = await Promise.all(
    SKINCARE_TYPES.map((t) =>
      listPosts({ q: t.query, pageSize: 4 })
        .then((r) => r.data)
        .catch(() => [] as BlsPost[]),
    ),
  );

  // Latest Arrivals — most recently added products (max 8 for the carousel)
  const latestProducts = await listProducts({ sort: 'newest', pageSize: 10 })
    .then((r) => r.data)
    .catch(() => [] as BlsProduct[]);

  // Facial Serums section — products in the bls-product-category 'facial-serums'
  const facialSerumProducts = await listProducts({ category: 'facial-serums', sort: 'newest', pageSize: 10 })
    .then((r) => r.data)
    .catch(() => [] as BlsProduct[]);

  // Facial Cleansers section — products in the bls-product-category 'facial-cleansers'
  const facialCleanserProducts = await listProducts({ category: 'facial-cleansers', sort: 'newest', pageSize: 10 })
    .then((r) => r.data)
    .catch(() => [] as BlsProduct[]);

  // Latest across all sections (de-duped)
  const latest: BlsPost[] = [];
  const seen = new Set<number>();
  for (const p of perSection
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    latest.push(p);
  }

  const reviews = bySection['skincare-reviews-path-to-glowing-skin'] ?? [];
  const articles = bySection['essential-guide-to-informative-articles'] ?? [];

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div data-testid="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <Hero />
      <ProductSelectionTools />
      <CategoryShowcase />
      <WelcomeIntro />
      <LatestArrivals products={latestProducts} />
      <CommitmentBlock />
      {/* Facial Serums product carousel (replaces former Moisturizer / Serum
          / Eye Cream post sections). Pulls from the bls-product-category
          'facial-serums' — create that category in Strapi or via the importer
          (BLS_PRODUCT_CATEGORY=facial-serums) to populate it. */}
      <FacialSerumsSection products={facialSerumProducts} />
      <OurGoalSection posts={latest.slice(0, 12)} />
      <FacialCleansersSection products={facialCleanserProducts} />
      <FirstStepSection />
      {articles.length > 0 && <ArticlesGrid posts={articles.slice(0, 5)} />}
      <ContactStrip />
    </div>
  );
}

/* ---------- HERO ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f8f5f2]" data-testid="home-hero">
      <div className="mx-auto grid min-h-[78vh] max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 lg:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="font-inter text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            BestLooking.Skin
          </p>
          <h1 className="mt-5 max-w-3xl font-display font-extrabold tracking-tight text-ink">
            Your Guide to the <span className="font-fraunces italic text-primary">Best</span> Skincare.
          </h1>
          <p className="mt-6 max-w-xl font-inter text-base font-light leading-8 text-ink/72 sm:text-lg">
            {SITE.name} is your go-to destination for comprehensive guidance on achieving healthy,
            radiant, glowing skin. Our mission is to provide you with the most current and accurate
            information about top-tier skincare products available today.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/best-product-comparisons"
              className="inline-flex items-center rounded-full bg-ink px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary"
            >
              Browse comparisons
            </Link>
            <Link
              href="/skincare-reviews-path-to-glowing-skin"
              className="inline-flex items-center rounded-full border border-ink/15 bg-white/70 px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:border-primary hover:text-primary"
            >
              Read reviews
            </Link>
          </div>
        </div>

        <div className="relative min-h-[360px] lg:min-h-[620px]">
          <div className="absolute inset-x-6 bottom-2 top-10 rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(17,17,17,0.08)] lg:inset-x-10" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-banner-products.png"
            alt="Curated skincare products"
            width={900}
            height={675}
            className="relative mx-auto h-full w-full max-w-2xl object-contain mix-blend-multiply"
          />
          <div className="absolute bottom-6 left-0 max-w-[17rem] rounded-2xl bg-ink px-5 py-4 text-white shadow-xl">
            <p className="font-inter text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Editorial focus</p>
            <p className="mt-2 font-display text-xl font-bold leading-tight">Comparisons, reviews and routines without the noise.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRODUCT SELECTION TOOLS — 4 large cards ---------- */

function ProductSelectionTools() {
  return (
    <section className="bg-white py-16 sm:py-20" data-testid="selection-tools">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Editorial picks"
          title="Product Selection Tools"
          subtitle="Four ways to find the right product — pick the one that matches what you're shopping for."
        />
        <div className="mt-10 grid border-y border-ink/10 lg:grid-cols-4">
          {TOOLS.map((t, index) => (
            <Link
              key={t.title}
              href={t.href}
              className="group relative flex min-h-[220px] flex-col justify-between border-ink/10 py-7 transition hover:bg-[#fff6f4] sm:px-5 lg:border-l lg:px-7 first:lg:border-l-0"
              data-testid={`tool-${t.href}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-inter text-xs font-semibold uppercase tracking-[0.26em] text-ink/35">
                    0{index + 1}
                  </span>
                  <span className="text-2xl" aria-hidden>{t.emoji}</span>
                </div>
                <h3 className="mt-8 max-w-[12rem] font-display font-bold leading-tight text-ink">
                  {t.title}
                </h3>
                <p className="mt-4 max-w-[15rem] text-sm font-light leading-6 text-ink/65">{t.blurb}</p>
              </div>
              <span className="mt-7 inline-flex items-center gap-2 font-inter text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Explore <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CATEGORY SHOWCASE ---------- */

function CategoryShowcase() {
  const [moisturizer, reviewsTile, serum, eyeCream] = SHOWCASE;

  return (
    <section className="bg-[#f8f5f2] py-16 sm:py-20" data-testid="category-showcase">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">Shop by concern</p>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-ink">Start with your routine.</h2>
          </div>
          <p className="max-w-md text-sm font-light leading-7 text-ink/65">
            Explore common skincare categories through visual entry points designed for quick browsing.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-[1.02fr_0.98fr] md:items-stretch">
          <ShowcaseTile tile={moisturizer} className="min-h-[440px] md:min-h-[620px]" featured />
          <div className="grid gap-4 sm:grid-cols-2">
            <ShowcaseTile tile={reviewsTile} className="min-h-[250px] sm:col-span-2 md:min-h-[300px]" />
            <ShowcaseTile tile={serum} className="min-h-[250px] md:min-h-[300px]" />
            <ShowcaseTile tile={eyeCream} className="min-h-[250px] md:min-h-[300px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseTile({
  tile,
  className,
  featured = false,
}: {
  tile: (typeof SHOWCASE)[number];
  className: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={tile.href}
      className={`group relative block overflow-hidden rounded-3xl ${className}`}
      data-testid={`showcase-${tile.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.img}
        alt={tile.label}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-ink/42 transition group-hover:bg-ink/30" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
      <span className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
        <span className={`${featured ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'} font-display font-extrabold leading-none text-white`}>
          {tile.label}
        </span>
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-lg text-ink transition group-hover:translate-x-1 sm:inline-flex" aria-hidden>
          →
        </span>
      </span>
    </Link>
  );
}

/* ---------- WELCOME INTRO (mission block, copy from bestlooking.skin) ---------- */

function WelcomeIntro() {
  return (
    <section className="bg-white py-20 sm:py-28" data-testid="welcome-intro">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">Welcome</p>
          <h2 className="mt-4 font-display font-extrabold leading-[1.05] tracking-tight text-ink">
            Welcome to<br />bestlooking.skin
          </h2>
        </div>
        <div className="space-y-6 border-l border-ink/10 pl-6 text-base font-light leading-8 text-ink/72 sm:pl-10 sm:text-lg sm:leading-9">
          <p>
            Welcome to BestLooking.Skin — your go-to destination for comprehensive guidance on
            achieving healthy, radiant and glowing skin. Our mission is to provide you with the most
            current and accurate information about top-tier skincare products available today. We
            are committed to helping you discover high-quality skincare products at affordable
            prices.
          </p>
          <p>
            Our team, comprised of seasoned skincare experts, diligently conducts rigorous research,
            comprehensive product comparisons and detailed reviews. Our aim is to empower you with
            the knowledge you need to make informed decisions about your skincare routine. We
            recognize that skincare is a personal journey, not a one-size-fits-all approach.
            Therefore, we strive to cover a diverse range of products to cater to various skin types
            and concerns.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- LATEST ARRIVALS ---------- */

function LatestArrivals({ products }: { products: BlsProduct[] }) {
  if (products.length === 0) {
    return (
      <section className="bg-[#f8f5f2] py-16 sm:py-20" data-testid="latest-arrivals-empty">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Just in"
            title="Recently Added"
            subtitle="Fresh products will appear here once they're added to the catalog."
            viewAll="/products"
          />
        </div>
      </section>
    );
  }
  return (
    <section className="bg-[#f8f5f2] py-16 sm:py-20" data-testid="latest-arrivals">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Just in"
          title="Recently Added"
          subtitle="The newest products in the catalog — handpicked for your routine."
          viewAll="/products"
        />
        <div className="mt-10 rounded-[1.75rem] bg-white px-4 py-6 shadow-[0_20px_70px_rgba(17,17,17,0.06)] sm:px-6">
          <ProductsCarousel products={products} />
        </div>
      </div>
    </section>
  );
}

/* ---------- COMMITMENT BLOCK (editorial copy from bestlooking.skin) ---------- */

function CommitmentBlock() {
  return (
    <section className="bg-ink py-20 text-white sm:py-24" data-testid="commitment-block">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">Promise</p>
          <h2 className="mt-4 font-display font-extrabold tracking-tight text-white">
            Our Commitment
          </h2>
        </div>
        <div className="space-y-6 text-base font-light leading-8 text-white/74 sm:text-lg sm:leading-9">
          <p>
            At BestLooking.Skin, we are committed to inclusivity. In addition to product reviews and
            recommendations, we offer informative articles and easy-to-follow how-to guides. Whether
            you’re a skincare novice or an expert, we have something for everyone, ensuring no one
            is left out in their skincare journey.
          </p>
          <p>
            We regularly update our ‘Top Rated Products’ section, showcasing the best skincare
            products as recommended by our readers and expert team. Thank you for choosing
            BestLooking.Skin. BestLooking.Skin is your trusted ally in your skincare journey. We
            hope you find our content helpful, enjoyable and inspiring as you work towards achieving
            the best-looking skin. Welcome to BestLooking.Skin — your premier destination and
            comprehensive guide to achieving healthy, radiant and glowing skin. Our mission, our
            commitment, is to provide you with the most exhaustive, current and accurate
            information about the finest skincare products available on the market today. We are
            unwavering in our dedication to helping you discover the highest quality skincare
            products at the most affordable prices, ensuring you do not have to compromise on your
            skincare regimen.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- FACIAL SERUMS — products carousel ---------- */

function FacialSerumsSection({ products }: { products: BlsProduct[] }) {
  return (
    <section className="bg-white py-16 sm:py-20" data-testid="facial-serums">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Editor's pick"
          title="Facial Serums"
          subtitle="Targeted treatments — vitamin C, hyaluronic, retinol and more."
          viewAll="/products?category=facial-serums"
        />
        {products.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink/55">
            No products in the <strong>Facial Serums</strong> product category yet — create the
            category in Strapi (BLS · Product Category) or run the Apify importer with{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">BLS_PRODUCT_CATEGORY=facial-serums</code>.
          </div>
        ) : (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <ProductsCarousel products={products} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- FACIAL CLEANSERS — products carousel ---------- */

function FacialCleansersSection({ products }: { products: BlsProduct[] }) {
  return (
    <section className="bg-[#f8f5f2] py-16 sm:py-20" data-testid="facial-cleansers">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Editor's pick"
          title="Facial Cleansers"
          subtitle="Wash, prep and reset — the first step in any solid routine."
          viewAll="/products?category=facial-cleansers"
        />
        {products.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-ink/15 bg-paper px-6 py-12 text-center text-sm text-ink/55">
            No products in the <strong>Facial Cleansers</strong> product category yet —
            create the category in Strapi (BLS · Product Category) or run the Apify importer with{' '}
            <code className="rounded bg-white px-1.5 py-0.5">BLS_PRODUCT_CATEGORY=facial-cleansers</code>.
          </div>
        ) : (
          <div className="mt-10 rounded-[1.75rem] bg-white px-4 py-6 shadow-[0_20px_70px_rgba(17,17,17,0.06)] sm:px-6">
            <ProductsCarousel products={products} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- SKINCARE-TYPE SECTIONS ---------- */

function SkincareTypeSection({
  label,
  query,
  posts,
  alt,
}: {
  label: string;
  query: string;
  posts: BlsPost[];
  alt?: boolean;
}) {
  return (
    <section
      className={alt ? 'bg-muted py-14' : 'bg-paper py-14'}
      data-testid={`skincare-type-${query}`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Shop the category"
          title={label}
          subtitle={`Latest editorial covering ${label.toLowerCase()} — picks, comparisons and how-to.`}
          viewAll={`/search?q=${encodeURIComponent(query)}`}
        />
        {posts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink/55">
            No posts mention {label} yet — check back after content is imported.
          </div>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {posts.slice(0, 4).map((p) => (
              <PostCard key={p.id} post={p} variant="tile" thumbBg="bg-white" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- OUR GOAL — research blurb + 2-column article links ---------- */

/* Our Goal — editorial layout inspired by harrygeorge.design:
   - Big multi-color heading at top (key phrases dimmed for emphasis)
   - 3-col row below: empty whitespace / body copy + CTA / right-aligned
     pillar list with + icons
   `posts` arg kept for parent compatibility; not rendered in this layout. */
const GOAL_PILLARS: { label: string; href: string }[] = [
  { label: 'How-to Guides', href: '/skincare-how-to-guides' },
  { label: 'Reviews',       href: '/skincare-reviews-path-to-glowing-skin' },
  { label: 'Comparisons',   href: '/best-product-comparisons' },
  { label: 'Top Rated',     href: '/top-rated-skincare-for-glowing-skin' },
];

function OurGoalSection({ posts: _posts }: { posts: BlsPost[] }) {
  return (
    <section className="bg-white py-20 sm:py-28" data-testid="our-goal">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-20">
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">Our approach</p>
            <h2 className="mt-4 max-w-5xl font-display font-bold tracking-tight text-ink"
                style={{ fontSize: 'clamp(2.1rem, 1.25rem + 4vw, 5rem)', lineHeight: 1.04 }}>
              Our goal is to equip you with the information to make
              <span className="text-ink/30"> informed skincare choices</span>
              {' '}— covering every skin type, every concern, and
              <span className="font-fraunces italic text-primary"> every routine</span>
              {' '}along the way.
            </h2>
          </div>

          <div className="lg:pt-14">
            <div className="text-sm font-light leading-7 text-ink/70 sm:text-base sm:leading-8">
            <p>
              We conduct rigorous research, comprehensive product comparisons, and detailed
              reviews. Skincare is not a ‘one-size-fits-all’ scenario — what works for one
              person may not work for another, so we cover a wide array of products to suit
              different skin types and concerns.
            </p>
            <p className="mt-4">
              Whether you’re just starting out or a seasoned expert, we publish how-to guides,
              ingredient deep-dives, and honest reviews to help you understand exactly how each
              product fits into your routine.
            </p>
            </div>

            <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10" data-testid="goal-pillars">
              {GOAL_PILLARS.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="group flex items-center justify-between py-4 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-ink/80 transition-colors hover:text-primary"
                  >
                    <span>{p.label}</span>
                    <span aria-hidden className="text-xl text-ink/30 transition group-hover:translate-x-1 group-hover:text-primary">+</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRODUCT REVIEWS — feature + 4-up ---------- */

function ProductReviews({ posts }: { posts: BlsPost[] }) {
  const [feature, ...rest] = posts;
  return (
    <section className="bg-white py-16" data-testid="product-reviews">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Hands-on"
          title="Product Reviews"
          subtitle="Honest takes on the products people are actually shopping for."
          viewAll="/skincare-reviews-path-to-glowing-skin"
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <PostCard post={feature} variant="feature" thumbBg="bg-white" />
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.slice(0, 4).map((p) => (
              <PostCard key={p.id} post={p} variant="tile" thumbBg="bg-white" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FIRST STEP TO GREAT SKIN — editorial closer ---------- */

function FirstStepSection() {
  return (
    <section className="bg-white py-20 sm:py-24" data-testid="first-step">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">Next step</p>
          <h2 className="mt-4 font-display font-extrabold tracking-tight text-ink">First Step to Great Skin</h2>
        </div>
        <div className="space-y-6 border-l border-ink/10 pl-6 text-base font-light leading-8 text-ink/72 sm:pl-10 sm:text-lg sm:leading-9">
          <p>
            Moreover, we regularly refresh our ‘Top Rated Products’ section, where we showcase the
            absolute crème de la crème in skincare as voted by our dedicated readers and our expert
            team. This section acts as a quick reference guide for anyone looking for the best
            skincare products as per our recommendations.
          </p>
          <p>
            We want to express our heartfelt gratitude for choosing BestLooking.Skin. BestLooking.Skin
            is your trusted ally and resource in your skincare journey. We hope that you find our
            content not only helpful but also enjoyable and inspiring. We’re truly honored to be a
            part of your journey towards achieving the best-looking skin.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- ARTICLES ---------- */

function ArticlesGrid({ posts }: { posts: BlsPost[] }) {
  return (
    <section className="bg-[#f8f5f2] py-16 sm:py-20" data-testid="articles">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Read more"
          title="Articles"
          subtitle="Background reading — ingredients, skin types and the science behind the bottle."
          viewAll="/essential-guide-to-informative-articles"
        />
        <div className="mt-10 rounded-[1.75rem] bg-white px-4 py-6 shadow-[0_20px_70px_rgba(17,17,17,0.06)] sm:px-6">
          <ArticlesCarousel posts={posts} />
        </div>
      </div>
    </section>
  );
}

/* ---------- CONTACT STRIP ---------- */

function ContactStrip() {
  return (
    <section className="bg-ink py-12 text-white" data-testid="contact-strip">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">Get in touch</p>
          <a href="mailto:contact@bestlooking.skin" className="mt-2 block font-display text-2xl font-bold text-white hover:text-primary">
            contact@bestlooking.skin
          </a>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-full bg-white px-6 py-3 font-inter text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-primary hover:text-white"
        >
          Contact form
        </Link>
      </div>
    </section>
  );
}

/* ---------- shared section header ---------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAll,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  viewAll?: string;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        <h3 className="mt-3 font-display font-extrabold tracking-tight text-ink">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm font-light leading-7 text-ink/65 sm:text-base">{subtitle}</p>
      </div>
      {viewAll && (
        <Link
          href={viewAll}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 py-2 font-inter text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-primary hover:text-primary"
        >
          See all
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
