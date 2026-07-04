import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/wit-logo.png";
import {
  Instagram,
  Send,
  Linkedin,
  Github,
  Globe,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/beyond-binary", label: "Beyond Binary" },
  // { to: "/projects", label: "Projects" },
  { to: "/recruit", label: "Recruitment" },
];

export default function SiteLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && mobileMenuRef.current?.contains(target)) {
        return;
      }

      setMobileMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur border-b border-hairline"
            : "bg-transparent"
        }`}
      >
        <div className="container-wit flex h-16 md:h-20 items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="NTU Women in Tech home"
          >
            <img
              src={logo}
              alt="NTU Women in Tech logo"
              className="h-9 w-9 md:h-10 md:w-10 object-contain"
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-[14px] text-ink">
                Women in Tech
              </span>
              <span className="mono-eyebrow text-[10px] text-ink-soft mt-1">
                NTU Singapore
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `mono-eyebrow px-3 py-2 rounded-full transition-colors ${
                    isActive
                      ? "text-ink bg-blush"
                      : "text-ink-soft hover:text-ink"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/recruit"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-ink text-background px-4 py-2 text-[11px] font-semibold uppercase hover:bg-primary-deep hover:text-ink transition-colors"
          >
            Join WIT <ArrowUpRight size={14} />
          </Link>

          {/* Mobile menu */}
          <div ref={mobileMenuRef} className="md:hidden relative">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-background/80 text-ink shadow-soft backdrop-blur transition-colors hover:bg-blush"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {mobileMenuOpen && (
              <nav
                id="mobile-navigation"
                className="absolute right-0 top-12 z-50 w-60 rounded-lg border border-hairline bg-background/95 p-2 shadow-pop backdrop-blur-md"
              >
                <div className="flex flex-col">
                  {NAV.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-blush text-ink"
                            : "text-ink-soft hover:bg-blush hover:text-ink"
                        }`
                      }
                    >
                      {n.label}
                    </NavLink>
                  ))}
                  <Link
                    to="/recruit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-1 px-3 py-2.5 text-sm font-semibold rounded-lg bg-ink text-background text-center transition-colors hover:bg-primary-deep hover:text-ink"
                  >
                    Join WIT
                  </Link>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

const SOCIALS = [
  {
    href: "https://www.instagram.com/ntu_witech/",
    label: "Instagram",
    icon: Instagram,
  },
  { href: "https://t.me/ntu_women_in_tech", label: "Telegram", icon: Send },
  {
    href: "https://linkedin.com/company/ntu-women-in-tech/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://github.com/NTUWIT",
    label: "GitHub",
    icon: Github,
  },
  { href: "https://ntubeyondbinary.com", label: "Beyond Binary", icon: Globe },
];

function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-blush/40 mt-24">
      {/* Main Footer */}
      <div className="container-wit py-8 md:py-10">
        {/* Top Row: Logo and Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Logo & Branding */}
          <div className="col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="NTU Women in Tech logo"
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <p className="font-display text-base text-ink">Women in Tech</p>
                <p className="mono-eyebrow text-[9px] text-ink-soft mt-0.5">
                  NTU Singapore
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-1">
            <p className="text-xs text-ink-soft leading-relaxed">
              Building the next generation of tech leaders through flagship
              events and mentorship.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="mono-eyebrow text-ink-soft uppercase text-xs font-semibold mb-3">
              Explore
            </p>
            <ul className="space-y-1.5">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="text-xs text-ink-soft hover:text-ink transition-colors"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="mono-eyebrow text-ink-soft uppercase text-xs font-semibold mb-3">
              Connect
            </p>
            <ul className="space-y-1.5">
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink transition-colors"
                  >
                    <s.icon size={14} /> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-hairline bg-background/50">
        <div className="container-wit py-4 md:py-5">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-start md:items-center text-xs text-ink-soft">
            <p>
              © {new Date().getFullYear()} NTU Women in Tech. All rights
              reserved.
            </p>
            <p>Made by NTU Women In Tech</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
