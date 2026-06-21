import Link from 'next/link';
import { SITE, SECTIONS } from '@/lib/site';
import { listCategories, type BlsCategory } from '@/lib/strapi';

const CONNECT_TAGLINE =
  'BestLooking.Skin is your trusted guide to better skincare — honest product reviews, ' +
  'clear ingredient breakdowns and practical routines that help you choose what truly ' +
  'works for your skin, your budget and your goals.';

const CONTACT_EMAIL = 'hello@bestlooking.skin';

export default async function Footer() {
  const year = new Date().getFullYear();
  const postCategories = await listCategories().catch(() =>
    SECTIONS.map((section, index) => ({
      id: index,
      name: section.title,
      slug: section.slug,
    })) as BlsCategory[],
  );

  return (
    <footer className="bg-white pt-16" data-testid="site-footer">
      <div className="border-t border-ink/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[25%_15%_20%_20%_20%]">

          {/* Col 1 — Connect (no heading). */}
          <div>
            <p className="text-base font-medium leading-6 text-ink/70">{CONNECT_TAGLINE}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="email-fill my-8 inline-block break-all font-display text-2xl font-bold text-ink"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="flex items-center" data-testid="social-links">
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} on Facebook`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:opacity-75 mr-[30px] last:mr-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.5V12h2.5V9.83c0-2.47 1.47-3.84 3.73-3.84 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0 0 22 12Z" />
                </svg>
              </a>
              <a
                href={SITE.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} on X (Twitter)`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:opacity-75 mr-[30px] last:mr-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                  <path d="M18.244 2H21.5l-7.55 8.63L22.75 22h-6.96l-5.45-7.13L4.04 22H.78l8.08-9.23L1.25 2h7.13l4.93 6.52L18.244 2Zm-1.22 18h1.93L7.06 4H5.04l11.984 16Z" />
                </svg>
              </a>
              <a
                href={SITE.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} on WhatsApp`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:opacity-75 mr-[30px] last:mr-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href="/feed.xml"
                aria-label={`${SITE.name} RSS feed`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition hover:opacity-75 mr-[30px] last:mr-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                  <path d="M4 4v3a13 13 0 0 1 13 13h3A16 16 0 0 0 4 4Zm0 6v3a7 7 0 0 1 7 7h3a10 10 0 0 0-10-10Zm2.25 7.25a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 6.25 17.25Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — About. Starts at track 3 so track 2 (10%) acts as an offset. */}
          <div className="lg:col-start-3">
            <h4 className="font-display !text-[18px] font-bold text-ink">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/"        className="text-ink/80 transition hover:text-primary">Home</Link></li>
              <li><Link href="/about"   className="text-ink/80 transition hover:text-primary">Our Story</Link></li>
              <li><Link href="/brands"  className="text-ink/80 transition hover:text-primary">Popular Brands</Link></li>
              <li><Link href="/sitemap" className="text-ink/80 transition hover:text-primary">Site Map</Link></li>
              <li><Link href="/contact" className="text-ink/80 transition hover:text-primary">Get in touch</Link></li>
            </ul>
          </div>

          {/* Col 3 — Post categories */}
          <div>
            <h4 className="font-display !text-[18px] font-bold text-ink">All Articles</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {postCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/${category.slug}`}
                    className="text-ink/80 transition hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Product categories */}
          <div>
            <h4 className="font-display !text-[18px] font-bold text-ink">Popular Products</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/categories/anti-aging"            className="text-ink/80 transition hover:text-primary">Anti-Aging</Link></li>
              <li><Link href="/categories/facial-cleansers"      className="text-ink/80 transition hover:text-primary">Facial Cleansers</Link></li>
              <li><Link href="/categories/facial-serums"         className="text-ink/80 transition hover:text-primary">Facial Serums</Link></li>
              <li><Link href="/categories/moisturisers"          className="text-ink/80 transition hover:text-primary">Moisturisers</Link></li>
              <li><Link href="/categories/toners-and-astringents" className="text-ink/80 transition hover:text-primary">Toners &amp; Astringents</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom strip — legal + copyright */}
      <div className="border-t border-ink/10">
        <div data-testid="footer-bottom" className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-5 text-[14px] text-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="!text-[14px] !font-normal">© {year} {SITE.name}. All Rights Reserved.</p>
          <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 self-end sm:self-auto">
            <li><Link href="/legal/terms"   className="text-ink/65 transition hover:text-primary">Terms and Conditions</Link></li>
            <li><Link href="/legal/privacy" className="text-ink/65 transition hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/legal/cookies" className="text-ink/65 transition hover:text-primary">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
