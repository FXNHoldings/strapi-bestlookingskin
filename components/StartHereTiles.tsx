'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Lottie from 'lottie-react';

type Tile = { slug: string; label: string; src: string };

const TILES: Tile[] = [
  { slug: 'product-comparisons', label: 'Comparisons', src: '/lottie/comparison.json' },
  { slug: 'product-reviews', label: 'Reviews', src: '/lottie/review.json' },
  { slug: 'top-rated-products', label: 'Top Rated', src: '/lottie/top-rated.json' },
  { slug: 'how-to-guides', label: 'How-to', src: '/lottie/how-to.json' },
];

function Tile({ slug, label, src }: Tile) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((r) => r.json())
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <Link
      href={`/${slug}`}
      className="group flex flex-col items-center gap-1 border border-ink/10 px-3 py-3 text-center text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
      data-testid={`start-here-${slug}`}
    >
      <span className="flex h-12 w-12 items-center justify-center" aria-hidden>
        {data && <Lottie animationData={data} loop className="h-full w-full" />}
      </span>
      {label}
    </Link>
  );
}

export default function StartHereTiles() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {TILES.map((t) => (
        <Tile key={t.slug} {...t} />
      ))}
    </div>
  );
}
