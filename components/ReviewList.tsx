import type { ProductReview } from '@/lib/strapi';

function Stars({ rating }: { rating: number }) {
  const pct = (Math.max(0, Math.min(5, rating)) / 5) * 100;
  return (
    <span aria-label={`${rating} out of 5 stars`} className="inline-flex items-center gap-1.5">
      <span className="relative inline-block text-sm leading-none">
        <span className="text-ink/20">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-amber-400"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="text-xs font-semibold text-ink/60">{rating.toFixed(1)}</span>
    </span>
  );
}

/** Approved first-party reviews as a responsive card grid. */
export default function ReviewList({ reviews }: { reviews: ProductReview[] }) {
  if (!reviews.length) {
    return <p className="italic text-ink/50">No written reviews yet — be the first to review this product.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id} className="flex flex-col rounded-xl border border-ink/10 bg-[#f5f7fd] p-5">
          <div className="flex items-center justify-between gap-3">
            <Stars rating={r.rating} />
            <span className="text-xs text-ink/45">
              {r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : ''}
            </span>
          </div>
          {r.title && <p className="mt-2.5 text-sm font-semibold text-ink">{r.title}</p>}
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink/75">{r.body}</p>
          <p className="mt-3 text-xs font-medium text-ink/55">— {r.authorName}</p>
        </li>
      ))}
    </ul>
  );
}
