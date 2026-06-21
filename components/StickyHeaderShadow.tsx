'use client';

import { useEffect } from 'react';

/**
 * Adds an `is-stuck` class to the sticky site header once the page is scrolled,
 * so a box-shadow (ported from originfacts.com — Tailwind shadow-md, defined in
 * globals.css) appears only while the nav is "activated"/stuck. Renders nothing.
 */
export default function StickyHeaderShadow() {
  useEffect(() => {
    const header = document.querySelector('[data-testid="site-header"]');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('is-stuck', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
