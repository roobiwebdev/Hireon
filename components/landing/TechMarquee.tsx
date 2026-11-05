import { getTechLogoUrl } from "@/lib/utils";
import Image from "next/image";

/**
 * SOURCE OF TRUTH KEYWORDS: TechMarquee, logo marquee, tech stack strip, scrolling logos, devicon, infinite loop
 * WHAT:  An endlessly scrolling strip of tech logos with faded edges. Pauses on hover.
 * WHY:   Shows the range of stacks you can practice for. Pure CSS (animate-marquee in
 *        globals.css), so it costs no JavaScript and stops for reduced-motion users.
 * WHERE: app/(marketing)/page.tsx with `marqueeTech` from constants/landing.ts.
 */
export default function TechMarquee({
  title,
  tech,
}: {
  title: string;
  tech: ReadonlyArray<string>;
}) {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const loop = [...tech, ...tech];

  return (
    <section aria-label={title} className="border-y border-primary-200/10 py-10">
      <p className="mb-6 text-center text-sm uppercase tracking-widest text-light-400">{title}</p>
      <div className="group relative overflow-hidden mask-fade-x">
        <ul className="flex w-max list-none animate-marquee gap-3 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= tech.length}
              className="flex items-center gap-2.5 rounded-full border border-primary-200/10 bg-dark-200/60 py-1.5 pl-1.5 pr-4"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-100">
                <Image src={getTechLogoUrl(name)} alt="" width={18} height={18} unoptimized className="size-[18px]" />
              </span>
              <span className="whitespace-nowrap text-sm text-light-100">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
