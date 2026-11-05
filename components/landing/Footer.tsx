import Image from "next/image";
import Link from "next/link";

/**
 * SOURCE OF TRUTH KEYWORDS: Footer, site footer, landing footer, copyright, footer links
 * WHAT:  Minimal footer: logo, one-line description, links, copyright.
 * WHY:   Closes the page quietly; links come in as props.
 * WHERE: app/(marketing)/layout.tsx with `footerLinks` from constants/landing.ts.
 */
export default function Footer({
  links,
}: {
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <footer className="border-t border-primary-200/10 px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={26} height={22} />
            <span className="font-semibold text-primary-100">HireonAI</span>
          </Link>
          <p className="text-sm">Voice mock interviews with scored feedback.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex list-none flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-light-100 transition-colors hover:text-primary-100">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-light-400">
        © {new Date().getFullYear()} HireonAI. All rights reserved.
      </p>
    </footer>
  );
}
