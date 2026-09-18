// components/layout/SiteFooter.tsx
import Link from "next/link";
import { ColumnIcon, InstagramIcon, LinkedInIcon, XIcon } from "./brand-icons";

const FOOTER_COLUMNS = [
  {
    heading: "Marketplace",
    links: [
      { label: "Browse Auctions", href: "/browse" },
      { label: "Categories", href: "/categories" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Sell an Item", href: "/sell" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Buyer Protection", href: "/buyer-protection" },
      { label: "Seller Guidelines", href: "/seller-guidelines" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com/novalot", icon: XIcon },
  {
    label: "Instagram",
    href: "https://instagram.com/novalot",
    icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/novalot",
    icon: LinkedInIcon,
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-panel text-brand-panel-foreground">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <ColumnIcon className="h-7 w-7 text-brand-gold" />
              <span className="font-serif text-3xl">NovaLot</span>
            </div>
            <p className="max-w-[220px] text-base opacity-70">
              Where the gavel falls live.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-brand-panel-foreground/25 text-brand-panel-foreground transition-colors hover:border-brand-panel-foreground/50 hover:bg-brand-panel-foreground/5"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h3 className="font-serif text-xl text-brand-gold">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base opacity-90 transition-opacity hover:opacity-100 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-brand-panel-foreground/15 pt-6">
          <p className="text-sm opacity-60">
            © {year} NovaLot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
