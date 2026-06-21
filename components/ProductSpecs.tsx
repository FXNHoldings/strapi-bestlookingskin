'use client';

import { useState } from 'react';

const LIMIT = 12;

/**
 * Right-hand column of the product page (Xtra-theme style): a "Specifications"
 * label/value table and an optional "Pros and cons" list with green plus-circle
 * icons. The spec table is clamped to the first {LIMIT} rows with a
 * "View more" / "View less" toggle when longer. Spec values may carry <wbr>
 * word-break hints.
 */
export default function ProductSpecs({
  specs,
  pros = [],
}: {
  specs: Array<[string, string]>;
  pros?: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  if (!specs.length && !pros.length) return null;

  const hasMore = specs.length > LIMIT;
  const shown = expanded || !hasMore ? specs : specs.slice(0, LIMIT);

  return (
    <div className="space-y-10" data-testid="product-specs">
      {specs.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Specifications</h2>
          <table className="mt-4 w-full">
            <tbody>
              {shown.map(([label, value]) => (
                <tr key={label} className="align-top">
                  <th className="whitespace-nowrap py-1 pr-6 text-left font-bold capitalize text-[#50657f]">
                    {label}:
                  </th>
                  <td className="py-1 text-[14px] text-[#50657f]" dangerouslySetInnerHTML={{ __html: value }} />
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-10 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {expanded ? 'View less' : `View more (${specs.length - LIMIT})`}
              <span aria-hidden className={expanded ? 'rotate-180' : ''}>▾</span>
            </button>
          )}
        </div>
      )}

      {pros.length > 0 && (
        <div>
          <h3 className="font-display text-2xl font-bold text-ink">Pros and cons</h3>
          <ul className="mt-4 space-y-2.5">
            {pros.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-ink/80">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                  <circle cx="12" cy="12" r="11" fill="#22a45d" />
                  <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
