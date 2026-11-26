"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { normalizeRoomCode } from "@/lib/room-code";
import { createInstantMeeting } from "@/app/actions/meeting";
import { Video, ArrowRight } from "lucide-react";

interface LandingActionsProps {
  isLoggedIn: boolean;
}

export function LandingActions({ isLoggedIn }: LandingActionsProps) {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStartMeeting = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      await createInstantMeeting();
    });
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(meetingCode);
    if (!clean) return;
    router.push(`/m/${clean}/lobby`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg">
      {/* Primary Action: Luminous Start a Meeting */}
      <button
        type="button"
        onClick={handleStartMeeting}
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] text-sm font-semibold rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#D99B52]/50 dark:focus:ring-[#F2C594]/50 active:scale-[0.99] disabled:opacity-50 cursor-pointer shrink-0 shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
      >
        <Video size={17} strokeWidth={2} />
        <span>{isPending ? "Starting..." : "Start a meeting"}</span>
      </button>

      {/* Secondary Action: Inline JetBrains Mono Room Code Input */}
      <form
        onSubmit={handleJoinMeeting}
        className="flex items-center flex-1 gap-2 bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-xl px-3.5 py-2 focus-within:border-[#D99B52] dark:focus-within:border-[#F2C594]/60 transition-colors duration-150 shadow-sm dark:shadow-none"
      >
        <input
          type="text"
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
          placeholder="Enter code (xxx-xxx-xxx)"
          className="bg-transparent text-sm text-[#111113] dark:text-[#F5F5F7] placeholder-[#6B6B70] dark:placeholder-[#8E8E93] focus:outline-none w-full font-mono tabular-nums tracking-wide"
        />
        <button
          type="submit"
          disabled={!meetingCode.trim()}
          className="flex items-center gap-1 text-xs font-semibold text-[#111113] dark:text-[#F5F5F7] hover:text-[#D99B52] dark:hover:text-[#F2C594] px-3 py-1.5 bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-lg border border-black/[0.08] dark:border-white/[0.08] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <span>Join</span>
          <ArrowRight size={13} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
