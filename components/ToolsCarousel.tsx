import Link from 'next/link';

export type ToolCard = {
  title: string;
  href: string;
  blurb: string;
  emoji: string;
  isNew?: boolean;
};

/**
 * "Editorial paths" cards — static responsive row modeled on the iconscout
 * asset-category layout: light lavender card, bold dark title (+ optional teal
 * NEW badge), muted slate-blue description, and a large illustration anchored
 * at the bottom. The `emoji` stands in for the illustration; swap in real
 * artwork by replacing the bottom <span> with an <img>.
 */
export default function ToolsCarousel({ tools }: { tools: ToolCard[] }) {
  return (
    <div
      className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
      data-testid="tools-carousel"
    >
      {tools.map((tool) => (
        <Link
          key={tool.title}
          href={tool.href}
          className="group flex min-h-[300px] flex-col rounded-2xl bg-[#f5f7fd] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(7,20,43,0.10)]"
          data-testid={`tool-${tool.href}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="font-display text-lg font-bold leading-tight text-[#16161d]">
              {tool.title}
            </h5>
            {tool.isNew && (
              <span className="rounded-full bg-[#1ec9b5] px-2 py-[3px] text-[10px] font-bold uppercase tracking-wider text-white">
                New
              </span>
            )}
          </div>
          <p className="mt-2.5 text-sm leading-6 text-[#6b7a99]">{tool.blurb}</p>
          <span
            className="mt-auto self-end pt-8 text-6xl leading-none transition duration-500 group-hover:scale-110"
            aria-hidden
          >
            {tool.emoji}
          </span>
        </Link>
      ))}
    </div>
  );
}
