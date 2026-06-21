'use client';

import { useState } from 'react';

/**
 * First-party review submission form. Posts to /api/review which stores the
 * review in Strapi as `pending`; it appears in the Reviews tab once an admin
 * approves it. Placed below the in-article ad on the product page.
 */
export default function ReviewForm({ productDocumentId }: { productDocumentId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setState('error');
      setMessage('Please choose a star rating.');
      return;
    }
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productDocumentId, authorName, email, title, body, rating }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState('done');
        setMessage(data.message || 'Thanks! Your review will appear once approved.');
      } else {
        setState('error');
        setMessage(data.message || 'Could not submit your review. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Could not submit your review. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-xl border border-ink/12 bg-[#f5f7fd] p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-ink">Write a review</h3>
      <p className="mt-1 text-sm text-ink/60">Share your experience to help other shoppers.</p>

      {/* Star picker */}
      <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 text-2xl leading-none transition"
          >
            <span className={(hover || rating) >= n ? 'text-amber-400' : 'text-ink/25'}>★</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional, not shown)"
          className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="mt-3 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you think of this product?"
        rows={4}
        className="mt-3 w-full resize-y rounded-md border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {state === 'error' && <p className="mt-2 text-xs text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-emphasis disabled:opacity-60"
      >
        {state === 'sending' ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
