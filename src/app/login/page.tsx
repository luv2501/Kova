import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/auth";
import { KovaLogo, KovaLogoMark } from "@/components/kova-logo";
import { ConnectionQuote } from "@/components/connection-quote";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;

  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", {
      redirectTo: callbackUrl || "/dashboard",
    });
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col lg:flex-row selection:bg-[#D99B52]/25 dark:selection:bg-[#F2C594]/25">
      {/* Left Panel (44% width on desktop): Real Architectural Concrete & Warm Light Backdrop */}
      <aside className="w-full lg:w-[44%] min-h-[340px] lg:min-h-screen bg-[#09090B] relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-black/[0.08] dark:border-white/[0.08]">
        {/* High-Resolution Architectural Interior Photograph */}
        <Image
          src="/images/architectural-bg.jpg"
          alt="Minimalist architectural concrete entryway illuminated with warm champagne linear lighting"
          fill
          priority
          className="object-cover object-center opacity-85"
          sizes="(max-width: 1024px) 100vw, 44vw"
        />

        {/* Atmospheric Gradient Overlay for Crisp Typography Contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(9, 9, 11, 0.72) 0%, rgba(9, 9, 11, 0.22) 45%, rgba(9, 9, 11, 0.92) 100%)",
          }}
        />

        {/* Top-Left Brand Mark (Always Luminous White & Gold over Dark Architectural Photo) */}
        <div className="relative z-10">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <KovaLogo size="md" forceDarkSurface />
          </Link>
        </div>

        {/* Bottom-Left Editorial Welcome Block */}
        <div className="relative z-10 mt-16 lg:mt-auto space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-[2px] h-16 bg-[#F2C594] rounded-full shrink-0 shadow-[0_0_16px_rgba(242,197,148,0.6)]" />
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[#F5F5F7] tracking-[-0.025em] leading-[1.1]">
                Welcome
                <br />
                Back
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#F5F5F7]/75 max-w-[260px] leading-relaxed">
                Glad to see you again.
                <br />
                Sign in to host your rooms.
              </p>
            </div>
          </div>

          {/* Signature Quote below Welcome Message */}
          <div className="pt-6 border-t border-white/[0.1] max-w-[280px]">
            <ConnectionQuote variant="compact" forceDarkSurface />
          </div>

          <div className="text-[11px] text-[#8E8E93]/80 font-mono tracking-wider">
            © 2026 Kova. All rights reserved.
          </div>
        </div>
      </aside>

      {/* Right Panel (56% width on desktop): Centered Luminous Card */}
      <main className="w-full lg:w-[56%] min-h-[580px] lg:min-h-screen flex flex-col relative">
        {/* Top Navbar Utility (Theme Toggle) */}
        <div className="w-full px-6 sm:px-10 pt-6 flex items-center justify-end relative z-20">
          <ThemeToggle />
        </div>

        {/* Subtle Ambient Background Glow behind card */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(242, 197, 148, 0.08) 0%, transparent 55%)",
          }}
        />

        {/* Centered Card Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative z-10">
          <div className="w-full max-w-[420px] bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/[0.04] dark:shadow-2xl dark:shadow-black/80">
            {/* Circular Emblem Badge */}
            <div className="w-14 h-14 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <KovaLogoMark className="w-6 h-6" />
            </div>

            {/* Crisp Heading & Subtitle */}
            <div className="text-center mb-8">
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                Sign in
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#6B6B70] dark:text-[#8E8E93]">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 px-3.5 py-2.5 border border-[#EF4444]/30 bg-[#EF4444]/10 rounded-xl text-xs text-[#EF4444] text-center">
                Authentication failed. Please try again.
              </div>
            )}

            {/* Primary Luminous Action Button */}
            <form action={handleGoogleSignIn}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] text-sm font-semibold rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#D99B52]/50 dark:focus:ring-[#F2C594]/50 active:scale-[0.99] cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
              >
                <span>Sign in with Google</span>
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </form>

            {/* 'or continue with' Divider */}
            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
              <span className="text-xs text-[#6B6B70] dark:text-[#8E8E93] font-medium">
                or continue with
              </span>
              <div className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
            </div>

            {/* Centered Circular 4-color Official Google 'G' Icon Button */}
            <form action={handleGoogleSignIn} className="flex justify-center">
              <button
                type="submit"
                aria-label="Continue with Google"
                title="Continue with Google"
                className="w-12 h-12 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 hover:border-[#D99B52] dark:hover:border-[#F2C594]/50 flex items-center justify-center transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer shadow-sm"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.35 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Below-Card Security Notice */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#6B6B70] dark:text-[#8E8E93]">
            <ShieldCheck
              size={14}
              strokeWidth={1.75}
              className="text-[#D99B52] dark:text-[#F2C594]"
            />
            <span>Your data is secure with us</span>
          </div>
        </div>
      </main>
    </div>
  );
}
