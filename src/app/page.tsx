import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LandingActions } from "@/components/landing-actions";
import { ConnectionQuote } from "@/components/connection-quote";
import {
  Mic,
  Video,
  MonitorUp,
  PhoneOff,
  Copy,
  ShieldCheck,
  Clock,
  Lock,
  Check,
  Users,
  Calendar,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col selection:bg-[#D99B52]/25 dark:selection:bg-[#F2C594]/25 relative overflow-x-hidden">
      {/* Warm Architectural Ambient Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none opacity-80 dark:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 18%, rgba(242, 197, 148, 0.13) 0%, transparent 72%)",
        }}
      />

      {/* Full-Width Glass-Hairline SaaS Navbar */}
      <Navbar isLoggedIn={isLoggedIn} />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section
          id="instant-meet"
          className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-16 flex flex-col items-center text-center"
        >
          {/* Editorial Kicker Quote Badge */}
          <div className="mb-8">
            <ConnectionQuote variant="kicker" />
          </div>

          {/* Crisp Outfit Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em] leading-[1.08] max-w-3xl">
            Online Video Calls, Meetings and Conferencing
          </h1>

          {/* Concise Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-[#6B6B70] dark:text-[#8E8E93] max-w-xl leading-relaxed">
            Private video rooms engineered for effortless conversation and
            zero-latency clarity.
          </p>

          {/* Working Hero Actions: Start Meeting + Inline Code Join */}
          <div className="mt-10 w-full flex justify-center">
            <LandingActions isLoggedIn={isLoggedIn} />
          </div>

          {/* Bento / Floating Architectural Product Preview Showcase */}
          <div className="mt-16 sm:mt-20 w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-5">
              {/* Left Flanking Floating Metric Cards */}
              <div className="w-full lg:w-[235px] shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-left">
                {/* Card 1: 99.9% Crystal Audio */}
                <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-5 shadow-md dark:shadow-xl dark:shadow-black/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                      Audio Fidelity
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="font-heading text-2xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                    99.9%{" "}
                    <span className="text-[#D99B52] dark:text-[#F2C594] text-sm font-medium">
                      Crystal Audio
                    </span>
                  </div>
                  {/* Minimal Frequency Bars */}
                  <div className="mt-3.5 flex items-end gap-1.5 h-6">
                    <span className="w-1.5 h-2.5 rounded-full bg-[#D99B52]/40 dark:bg-[#F2C594]/35" />
                    <span className="w-1.5 h-4 rounded-full bg-[#D99B52]/70 dark:bg-[#F2C594]/65" />
                    <span className="w-1.5 h-6 rounded-full bg-[#D99B52] dark:bg-[#F2C594]" />
                    <span className="w-1.5 h-5 rounded-full bg-[#D99B52]/80 dark:bg-[#F2C594]/75" />
                    <span className="w-1.5 h-3 rounded-full bg-[#D99B52]/50 dark:bg-[#F2C594]/45" />
                    <span className="ml-auto font-mono tabular-nums text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                      48kHz
                    </span>
                  </div>
                </div>

                {/* Card 2: Zero-Install WebRTC */}
                <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-5 shadow-md dark:shadow-xl dark:shadow-black/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck
                      size={16}
                      strokeWidth={1.75}
                      className="text-[#B47B38] dark:text-[#F2C594] shrink-0"
                    />
                    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                      Transport
                    </span>
                  </div>
                  <div className="font-heading text-base font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.02em]">
                    Zero-Install WebRTC
                  </div>
                  <p className="mt-1.5 text-xs text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
                    Encrypted browser rooms ready in one click—no downloads.
                  </p>
                </div>
              </div>

              {/* Central Sleek Browser/Device Meeting Preview Card */}
              <div className="flex-1 w-full bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-3xl overflow-hidden shadow-xl shadow-black/[0.06] dark:shadow-2xl dark:shadow-black/80 text-left">
                {/* Browser Window Chrome */}
                <div className="h-11 px-4 border-b border-black/[0.08] dark:border-white/[0.08] bg-[#FAF9F6] dark:bg-[#09090B]/90 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                    <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                    <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                  </div>

                  <div className="px-3 py-1 rounded-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] font-mono tabular-nums text-[11px] text-[#6B6B70] dark:text-[#8E8E93] truncate">
                    kova.meet/m/arc-k9x-21p
                  </div>

                  <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px] text-[#111113] dark:text-[#F5F5F7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>00:42:18</span>
                  </div>
                </div>

                {/* Product UI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Left Sidebar: Today's Rooms & Upcoming */}
                  <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-black/[0.08] dark:border-white/[0.08] p-5 space-y-4 bg-[#FAF9F6]/60 dark:bg-[#0D0D0F]/50">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                        Today&apos;s Rooms
                      </span>
                      <span className="font-mono tabular-nums text-[10px] text-[#D99B52] dark:text-[#F2C594]">
                        2 Active
                      </span>
                    </div>

                    {/* Live Room Item */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading text-xs font-semibold text-[#111113] dark:text-[#F5F5F7]">
                          Architecture Sync
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-[#10B981]" />
                          Live
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono tabular-nums text-[#6B6B70] dark:text-[#8E8E93]">
                        <span>arc-k9x-21p</span>
                        <span>4 in call</span>
                      </div>
                    </div>

                    {/* Upcoming — Design Review */}
                    <div className="p-3.5 rounded-xl bg-[#F2F0EB]/60 dark:bg-[#1A1A1E]/70 border border-[#D99B52]/30 dark:border-[#F2C594]/25">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading text-xs font-semibold text-[#111113] dark:text-[#F5F5F7]">
                          Upcoming — Design Review
                        </span>
                        <Clock
                          size={12}
                          strokeWidth={1.75}
                          className="text-[#D99B52] dark:text-[#F2C594] shrink-0"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono tabular-nums text-[#6B6B70] dark:text-[#8E8E93]">
                        <span>14:30 UTC</span>
                        <span className="text-[#D99B52] dark:text-[#F2C594]">
                          Waiting Room On
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Stage: Live Speaker Tile & Floating Dock */}
                  <div className="md:col-span-7 p-5 flex flex-col justify-between bg-[#FAF9F6] dark:bg-[#09090B]">
                    {/* Video Tiles Stage */}
                    <div className="space-y-3">
                      {/* Active Speaker Tile (#10B981 Ring) */}
                      <div className="relative rounded-xl bg-white dark:bg-[#131316] border-2 border-[#10B981] p-4 min-h-[146px] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.08] font-mono text-[10px] text-[#D99B52] dark:text-[#F2C594]">
                            Host
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] font-mono text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            Speaking
                          </span>
                        </div>

                        {/* Centered Minimal Speaker Emblem */}
                        <div className="my-2 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-[#10B981]/40 flex items-center justify-center font-heading text-sm font-semibold text-[#111113] dark:text-[#F5F5F7]">
                            MC
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#111113] dark:text-[#F5F5F7]">
                            Maya Chen
                          </span>
                          <span className="font-mono text-[10px] text-[#6B6B70] dark:text-[#8E8E93]">
                            HD 1080p
                          </span>
                        </div>
                      </div>

                      {/* Secondary Participant Strip */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] px-3 py-2 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-[#111113] dark:text-[#F5F5F7] truncate">
                            Siddharth K.
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="rounded-xl bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] px-3 py-2 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-[#6B6B70] dark:text-[#8E8E93] truncate">
                            Liam O&apos;Connor
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                        </div>
                      </div>
                    </div>

                    {/* Floating In-Call Control Dock Preview (backdrop-blur-md) */}
                    <div className="mt-4 flex justify-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white/90 dark:bg-[#1A1A1E]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1]">
                        <span className="p-1.5 rounded-md bg-[#F2F0EB] dark:bg-white/[0.06] text-[#111113] dark:text-[#F5F5F7]">
                          <Mic size={13} strokeWidth={1.75} />
                        </span>
                        <span className="p-1.5 rounded-md bg-[#F2F0EB] dark:bg-white/[0.06] text-[#111113] dark:text-[#F5F5F7]">
                          <Video size={13} strokeWidth={1.75} />
                        </span>
                        <span className="p-1.5 rounded-md bg-[#D99B52]/15 dark:bg-[#F2C594]/15 text-[#D99B52] dark:text-[#F2C594]">
                          <MonitorUp size={13} strokeWidth={1.75} />
                        </span>
                        <span className="p-1.5 rounded-md bg-[#EF4444] text-white">
                          <PhoneOff size={13} strokeWidth={1.75} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Flanking Floating Invite & Lobby Card */}
              <div className="w-full lg:w-[245px] shrink-0 space-y-4 text-left">
                <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-5 shadow-md dark:shadow-xl dark:shadow-black/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                      Invite &amp; Lobby
                    </span>
                    <Users
                      size={14}
                      strokeWidth={1.75}
                      className="text-[#D99B52] dark:text-[#F2C594]"
                    />
                  </div>

                  {/* Quick Copy Link Preview */}
                  <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#09090B] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-2">
                    <span className="font-mono tabular-nums text-[11px] text-[#111113] dark:text-[#F5F5F7] truncate">
                      arc-k9x-21p
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#D99B52] dark:text-[#F2C594] shrink-0">
                      <Copy size={11} strokeWidth={1.75} />
                      Copy
                    </span>
                  </div>

                  {/* Waiting Room Admittance Preview */}
                  <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-[#111113] dark:text-[#F5F5F7]">
                          Elena Vance
                        </div>
                        <div className="text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                          Waiting in lobby
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#D99B52] dark:bg-[#F2C594]" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-md bg-[#18181B] dark:bg-[#F2C594] text-[#FAF9F6] dark:text-[#09090B] text-[11px] font-semibold">
                        <Check size={11} strokeWidth={2} />
                        Admit
                      </span>
                      <span className="px-2.5 py-1.5 rounded-md bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                        Decline
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clean 3-Row Capabilities / Workflow Section */}
        <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-24 border-t border-black/[0.08] dark:border-white/[0.08]">
          <div className="mb-14 max-w-xl">
            <div className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#B47B38] dark:text-[#F2C594] mb-3">
              Workflow Architecture
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
              Built for uninterrupted focus.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
              Every detail exists to keep teams connected without visual noise,
              account barriers, or lag.
            </p>
          </div>

          <div className="divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y border-black/[0.08] dark:border-white/[0.08]">
            {/* Row 1: Instant Rooms */}
            <div
              id="rooms"
              className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start scroll-mt-20"
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 flex items-center justify-center text-[#D99B52] dark:text-[#F2C594] shrink-0">
                  <Video size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA] block">
                    01 / Rooms
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.02em]">
                    Instant Rooms
                  </h3>
                </div>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
                  Allocate a collision-free 9-character room code (
                  <code className="font-mono text-xs text-[#111113] dark:text-[#F2C594] bg-[#F2F0EB] dark:bg-[#1A1A1E] px-1.5 py-0.5 rounded">
                    xxx-xxx-xxx
                  </code>
                  ) in one click. Invited guests enter the pre-call lobby
                  directly from their browser without creating an account or
                  installing software.
                </p>
              </div>
            </div>

            {/* Row 2: Waiting Room Controls */}
            <div
              id="security"
              className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start scroll-mt-20"
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 flex items-center justify-center text-[#D99B52] dark:text-[#F2C594] shrink-0">
                  <Lock size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA] block">
                    02 / Security
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.02em]">
                    Waiting Room Controls
                  </h3>
                </div>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
                  Enable waiting rooms per session so unauthenticated guests
                  wait cleanly until the host admits them. Lock rooms mid-call
                  and protect host dashboards with Google OAuth and encrypted
                  session tokens.
                </p>
              </div>
            </div>

            {/* Row 3: Screen Sharing & Scheduling */}
            <div
              id="schedule"
              className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start scroll-mt-20"
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 flex items-center justify-center text-[#D99B52] dark:text-[#F2C594] shrink-0">
                  <Calendar size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA] block">
                    03 / Collaboration
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.02em]">
                    Screen Sharing &amp; Scheduling
                  </h3>
                </div>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
                  Schedule titled team reviews with exact timestamps, share
                  invite links in a single click, and present codebases or
                  design files at native resolution with active speaker rings
                  and tactile keyboard shortcuts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Multi-Column Editorial Footer */}
      <Footer />
    </div>
  );
}
