"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Video,
  Calendar,
  Copy,
  Check,
  ArrowRight,
  LogOut,
  X,
  Clock,
  Shield,
  Layers,
} from "lucide-react";
import { createInstantMeeting, scheduleMeeting } from "@/app/actions/meeting";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { normalizeRoomCode } from "@/lib/room-code";

interface MeetingItem {
  id: string;
  title: string;
  roomCode: string;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  scheduledAt: string | null;
  createdAt: string;
  _count?: {
    waitingGuests: number;
  };
}

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initialMeetings: MeetingItem[];
}

function getUserInitials(name?: string | null, email?: string | null): string {
  const cleanName = (name || "").trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }
  const cleanEmail = (email || "U").trim();
  return cleanEmail.slice(0, 2).toUpperCase();
}

export function DashboardClient({
  user,
  initialMeetings,
}: DashboardClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [isInstantPending, startInstantTransition] = useTransition();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick join code state
  const [quickCode, setQuickCode] = useState("");

  // Schedule modal form state
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [isScheduling, startScheduleTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateInstant = () => {
    startInstantTransition(async () => {
      await createInstantMeeting();
    });
  };

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(quickCode);
    if (!clean) return;
    router.push(`/m/${clean}/lobby`);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    startScheduleTransition(async () => {
      try {
        const created = await scheduleMeeting({
          title: scheduleTitle,
          scheduledAt: scheduleDate
            ? new Date(scheduleDate).toISOString()
            : undefined,
          waitingRoomEnabled,
        });

        setMeetings((prev) => [
          {
            ...created,
            scheduledAt: created.scheduledAt
              ? created.scheduledAt.toISOString()
              : null,
            createdAt: created.createdAt.toISOString(),
          },
          ...prev,
        ]);

        setScheduleTitle("");
        setScheduleDate("");
        setWaitingRoomEnabled(false);
        setIsScheduleModalOpen(false);
      } catch (err) {
        console.error("Failed to schedule meeting:", err);
      }
    });
  };

  const handleCopyLink = async (roomCode: string) => {
    const inviteUrl = `${window.location.origin}/m/${roomCode}/lobby`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedCode(roomCode);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col selection:bg-[#D99B52]/25 dark:selection:bg-[#F2C594]/25 relative">
      {/* Subtle Ambient Top Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] pointer-events-none opacity-60 dark:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(242, 197, 148, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 flex items-center justify-between relative z-10">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <KovaLogo size="md" />
        </Link>

        {/* User Identity, Theme Toggle & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-2.5 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
            {user.image && !avatarError ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={28}
                height={28}
                unoptimized
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-7 h-7 rounded-full border border-black/[0.08] dark:border-white/[0.12] object-cover shrink-0"
              />
            ) : (
              <div
                aria-label={user.name || user.email || "User"}
                className="w-7 h-7 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center text-[11px] font-semibold text-[#B47B38] dark:text-[#F2C594] shrink-0 tracking-tight"
              >
                {getUserInitials(user.name, user.email)}
              </div>
            )}
            <span className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7] hidden sm:inline">
              {user.name || user.email}
            </span>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] bg-white dark:bg-[#131316] hover:bg-[#F2F0EB] dark:hover:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-md transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-xs dark:shadow-none"
          >
            <LogOut size={13} strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Two-Column Executive Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Column (340px): Action Center */}
          <aside className="w-full lg:w-[340px] shrink-0 space-y-5">
            {/* Primary Actions Card */}
            <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-6 shadow-sm dark:shadow-xl dark:shadow-black/40">
              <h2 className="font-heading text-base font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                Host Actions
              </h2>
              <p className="text-xs text-[#6B6B70] dark:text-[#8E8E93] mt-1 mb-5">
                Start a private room or schedule ahead.
              </p>

              <div className="space-y-3">
                {/* Primary Luminous Button: New Instant Meeting */}
                <button
                  type="button"
                  onClick={handleCreateInstant}
                  disabled={isInstantPending}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] font-semibold text-sm rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#D99B52]/50 dark:focus:ring-[#F2C594]/50 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
                >
                  <Video size={17} strokeWidth={2} />
                  <span>
                    {isInstantPending ? "Creating room..." : "New Instant Meeting"}
                  </span>
                </button>

                {/* Secondary Button: Schedule Room */}
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] text-[#111113] dark:text-[#F5F5F7] hover:text-[#D99B52] dark:hover:text-[#F2C594] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/10 hover:border-[#D99B52]/50 dark:hover:border-[#F2C594]/35 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                >
                  <Calendar size={15} strokeWidth={1.75} />
                  <span>Schedule Room</span>
                </button>
              </div>
            </div>

            {/* Quick Join by Code Widget */}
            <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-6 shadow-sm dark:shadow-xl dark:shadow-black/40">
              <h3 className="font-heading text-base font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                Join by Code
              </h3>
              <p className="text-xs text-[#6B6B70] dark:text-[#8E8E93] mt-1 mb-4">
                Enter a 9-character code to enter a room.
              </p>

              <form onSubmit={handleQuickJoin} className="space-y-3">
                <input
                  type="text"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  placeholder="xxx-xxx-xxx"
                  className="w-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#111113] dark:text-[#F5F5F7] placeholder-[#6B6B70] dark:placeholder-[#8E8E93] font-mono tabular-nums focus:outline-none focus:border-[#D99B52] dark:focus:border-[#F2C594]/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!quickCode.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] text-xs font-semibold text-[#111113] dark:text-[#F5F5F7] hover:text-[#D99B52] dark:hover:text-[#F2C594] rounded-xl border border-black/[0.08] dark:border-white/[0.08] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Enter Room</span>
                  <ArrowRight size={13} strokeWidth={1.75} />
                </button>
              </form>
            </div>
          </aside>

          {/* Right Column: Spacious Luminous Meeting Cards */}
          <section className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                  Your Rooms
                </h2>
                <span className="font-mono tabular-nums text-xs text-[#D99B52] dark:text-[#F2C594] bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-[#D99B52]/30 dark:border-[#F2C594]/25 px-2.5 py-0.5 rounded-full">
                  {meetings.length}
                </span>
              </div>
            </div>

            {meetings.length === 0 ? (
              <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl py-16 px-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-xl dark:shadow-black/40">
                <div className="w-12 h-12 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-[#D99B52] dark:text-[#F2C594] mb-4">
                  <Layers size={22} strokeWidth={1.75} />
                </div>
                <p className="font-heading text-base font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.02em]">
                  No rooms yet
                </p>
                <p className="text-xs text-[#6B6B70] dark:text-[#8E8E93] mt-1.5 max-w-xs leading-relaxed">
                  Create an instant room from the panel on the left or schedule one for later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => {
                  const isCopied = copiedCode === meeting.roomCode;
                  return (
                    <div
                      key={meeting.id}
                      className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 hover:border-black/[0.15] dark:hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-150 shadow-sm dark:shadow-lg dark:shadow-black/30"
                    >
                      {/* Top Row: Title & Status */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading font-semibold text-base text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                            {meeting.title}
                          </h3>
                          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                            {/* Room Code Badge */}
                            <span className="font-mono tabular-nums text-xs px-2.5 py-1 bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] border border-black/[0.08] dark:border-white/[0.08] rounded-md tracking-wider">
                              {meeting.roomCode}
                            </span>

                            {/* Waiting Room Badge */}
                            {meeting.waitingRoomEnabled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D99B52] dark:text-[#F2C594] bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-[#D99B52]/30 dark:border-[#F2C594]/25 px-2.5 py-0.5 rounded-md">
                                <Shield size={11} strokeWidth={1.75} />
                                <span>Waiting Room</span>
                              </span>
                            ) : null}

                            {/* Schedule / Time */}
                            <span className="inline-flex items-center gap-1 text-xs text-[#6B6B70] dark:text-[#8E8E93] font-mono tabular-nums">
                              <Clock size={12} strokeWidth={1.75} />
                              {meeting.scheduledAt ? (
                                <span>
                                  {new Date(meeting.scheduledAt).toLocaleString(
                                    [],
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              ) : (
                                <span>
                                  {new Date(meeting.createdAt).toLocaleDateString(
                                    [],
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {meeting.status === "LIVE" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                              Live
                            </span>
                          )}
                          {meeting.status === "SCHEDULED" && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-[#D99B52] dark:text-[#F2C594] bg-[#D99B52]/10 dark:bg-[#F2C594]/10 border border-[#D99B52]/30 dark:border-[#F2C594]/25">
                              Scheduled
                            </span>
                          )}
                          {meeting.status === "ENDED" && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08]">
                              Ended
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(meeting.roomCode)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-lg transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check
                                size={13}
                                strokeWidth={2}
                                className="text-[#D99B52] dark:text-[#F2C594]"
                              />
                              <span className="text-[#D99B52] dark:text-[#F2C594] font-semibold">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} strokeWidth={1.75} />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        {/* Enter Room Button */}
                        <Link
                          href={`/m/${meeting.roomCode}/lobby`}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-[#FAF9F6] bg-[#18181B] hover:bg-[#27272A] dark:text-[#09090B] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] rounded-lg transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm dark:shadow-[0_0_20px_-4px_rgba(242,197,148,0.3)]"
                        >
                          <span>Enter Room</span>
                          <ArrowRight size={13} strokeWidth={2} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Schedule Meeting Modal via createPortal */}
      {isScheduleModalOpen && mounted && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-3xl p-6 sm:p-8 text-[#111113] dark:text-[#F5F5F7] shadow-2xl relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
                  <h2 className="font-heading text-lg font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                    Schedule Room
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] transition-colors p-1 cursor-pointer"
                  >
                    <X size={16} strokeWidth={1.75} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleScheduleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111113] dark:text-[#F5F5F7] mb-1.5">
                      Room Title
                    </label>
                    <input
                      type="text"
                      required
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      placeholder="e.g. Product Architecture Review"
                      className="w-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#111113] dark:text-[#F5F5F7] placeholder-[#6B6B70] dark:placeholder-[#8E8E93] focus:outline-none focus:border-[#D99B52] dark:focus:border-[#F2C594]/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111113] dark:text-[#F5F5F7] mb-1.5">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#111113] dark:text-[#F5F5F7] font-mono tabular-nums focus:outline-none focus:border-[#D99B52] dark:focus:border-[#F2C594]/60 transition-colors"
                    />
                  </div>

                  {/* Waiting Room Toggle */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7]">
                        Enable Waiting Room
                      </div>
                      <div className="text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                        Guests require host admittance before entry.
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={waitingRoomEnabled}
                      onClick={() => setWaitingRoomEnabled(!waitingRoomEnabled)}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer border ${
                        waitingRoomEnabled
                          ? "bg-[#D99B52] border-[#D99B52] dark:bg-[#F2C594] dark:border-[#F2C594]"
                          : "bg-[#F2F0EB] border-black/[0.12] dark:bg-[#1A1A1E] dark:border-white/[0.12]"
                      }`}
                    >
                      <span
                        className={`block w-3.5 h-3.5 rounded-full transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          waitingRoomEnabled
                            ? "bg-white dark:bg-[#09090B] translate-x-4"
                            : "bg-[#6B6B70] dark:bg-white translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-5 flex items-center justify-end gap-2.5 border-t border-black/[0.08] dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isScheduling || !scheduleTitle.trim()}
                      className="px-5 py-2 text-xs font-semibold text-[#FAF9F6] bg-[#18181B] hover:bg-[#27272A] dark:text-[#09090B] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#D99B52]/50 dark:focus:ring-[#F2C594]/50 disabled:opacity-50 cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
                    >
                      {isScheduling ? "Scheduling..." : "Schedule Room"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
