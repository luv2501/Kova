import Link from "next/link";
import { KovaLogo } from "@/components/kova-logo";
import { ConnectionQuote } from "@/components/connection-quote";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand & Signature Quote Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <KovaLogo size="md" />
            </Link>

            <ConnectionQuote variant="compact" />

            <a
              href="mailto:luvagarwal2501@gmail.com"
              className="inline-block font-mono text-xs text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F2C594] tracking-wider transition-colors duration-150"
            >
              luvagarwal2501@gmail.com
            </a>
          </div>

          {/* Product Column */}
          <div className="md:col-span-3 space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6B70] dark:text-[#8E8E93]">
              Product
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-[#111113]/85 dark:text-[#F5F5F7]/85">
              <li>
                <a
                  href="#instant-meet"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Start Meeting
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#instant-meet"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Join by Code
                </a>
              </li>
              <li>
                <a
                  href="#schedule"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Schedule Room
                </a>
              </li>
            </ul>
          </div>

          {/* Access & Capabilities Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6B70] dark:text-[#8E8E93]">
              Access
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-[#111113]/85 dark:text-[#F5F5F7]/85">
              <li>
                <Link
                  href="/login"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <a
                  href="#rooms"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Instant Rooms
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="hover:text-[#D99B52] dark:hover:text-[#F2C594] transition-colors duration-150"
                >
                  Waiting Room Controls
                </a>
              </li>
            </ul>
          </div>

          {/* Studio Status Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6B70] dark:text-[#8E8E93]">
              System
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] text-[11px] font-mono text-[#6B6B70] dark:text-[#8E8E93]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Operational</span>
            </div>
            <div className="font-mono text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
              v1.0 Studio
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-14 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6B6B70] dark:text-[#8E8E93] font-mono">
          <span>© 2026 Kova Inc. All rights reserved.</span>
          <span>Architectural Video Workspace • Built for Clarity</span>
        </div>
      </div>
    </footer>
  );
}
