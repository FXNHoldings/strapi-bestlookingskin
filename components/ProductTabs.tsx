'use client';

import { useState } from 'react';

/**
 * Product detail tabs: "Product Descriptions", "Specifications", "Reviews".
 * `description` is a server-rendered node (the ProductDescription markdown);
 * `specs` is a list of [label, value] rows for the Specifications table;
 * `reviews` is a server-rendered node for the Reviews tab.
 */
type TabKey = 'desc' | 'specs' | 'reviews';

export default function ProductTabs({
  description,
  specs = [],
  reviews,
}: {
  description: React.ReactNode;
  specs?: Array<[string, string]>;
  reviews?: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>('desc');

  const tabBtn = (key: TabKey, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => setTab(key)}
      className={
        'cursor-pointer rounded-[4px] px-5 py-2 text-sm font-semibold capitalize transition ' +
        (tab === key
          ? 'bg-white text-[#1f2d4d] shadow-sm'
          : 'text-ink/45 hover:text-ink/70')
      }
    >
      {label}
    </button>
  );

  return (
    <section className="mt-16" data-testid="product-tabs">
      <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-[4px] bg-[#eceef3] p-1">
        {tabBtn('desc', 'Product Descriptions')}
        {specs.length > 0 && tabBtn('specs', 'Specifications')}
        {reviews != null && tabBtn('reviews', 'Reviews')}
      </div>

      {tab === 'desc' && (
        <div className="mt-6 text-base leading-7 text-ink/80">{description}</div>
      )}

      {tab === 'specs' && (
        <div className="mt-6">
          {specs.length > 0 ? (
            <table className="w-full border-collapse text-sm">
              <tbody>
                {specs.map(([label, value]) => (
                  <tr key={label} className="border-b border-ink/10">
                    <th className="w-1/3 py-2 pr-4 text-left align-top font-semibold capitalize text-ink">{label}</th>
                    {/* Values may carry <wbr> word-break hints from the source. */}
                    <td className="py-2 text-ink/75" dangerouslySetInnerHTML={{ __html: value }} />
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="italic text-ink/50">
              No specifications yet — add them in Strapi → Commerce · Product → Specs → technicalSpecs.
            </p>
          )}
        </div>
      )}

      {tab === 'reviews' && reviews != null && (
        <div className="mt-6 text-sm leading-7 text-ink/80">{reviews}</div>
      )}
    </section>
  );
}
