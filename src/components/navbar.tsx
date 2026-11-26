import Link from "next/link";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF9F6]/85 dark:bg-[#09090B]/85 border-b border-black/[0.08] dark:border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between gap-4">
        {/* Left: Bespoke KOVA Logo + Studio Contact Tag */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <KovaLogo size="md" />
          </Link>
          <span
            className="hidden sm:inline text-black/20 dark:text-white/20 font-mono text-xs select-none"
            aria-hidden="true"
          >
            /
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-[#6B6B70] dark:text-[#8E8E93] tracking-wider">
            hello@kova.meet
          </span>
        </div>

        {/* Center: Smooth Scroll Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-3 text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93]"
        >
          <a
            href="#rooms"
            className="hover:text-[#111113] dark:hover:text-[#F2C594] transition-colors duration-150 px-1.5 py-1"
          >
            Rooms
          </a>
          <span className="text-black/20 dark:text-white/20 select-none" aria-hidden="true">
            •
          </span>
          <a
            href="#security"
            className="hover:text-[#111113] dark:hover:text-[#F2C594] transition-colors duration-150 px-1.5 py-1"
          >
            Security
          </a>
          <span className="text-black/20 dark:text-white/20 select-none" aria-hidden="true">
            •
          </span>
          <a
            href="#instant-meet"
            className="hover:text-[#111113] dark:hover:text-[#F2C594] transition-colors duration-150 px-1.5 py-1"
          >
            Instant Meet
          </a>
          <span className="text-black/20 dark:text-white/20 select-none" aria-hidden="true">
            •
          </span>
          <a
            href="#schedule"
            className="hover:text-[#111113] dark:hover:text-[#F2C594] transition-colors duration-150 px-1.5 py-1"
          >
            Schedule
          </a>
        </nav>

        {/* Right: Theme Toggle, Auth Link & High-Contrast Pill CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] px-2.5 py-1.5 transition-colors duration-150"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] px-2.5 py-1.5 transition-colors duration-150"
            >
              Login
            </Link>
          )}

          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] text-xs font-semibold transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm dark:shadow-[0_0_20px_-4px_rgba(242,197,148,0.35)]"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </div>
    </header>
  );
}
