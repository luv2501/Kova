import Link from "next/link";
import { db } from "@/lib/db";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Video, Mic, Camera } from "lucide-react";

interface LobbyPageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default async function LobbyPage({ params }: LobbyPageProps) {
  const { roomCode } = await params;

  const meeting = await db.meeting.findUnique({
    where: { roomCode },
    select: {
      id: true,
      title: true,
      roomCode: true,
      waitingRoomEnabled: true,
      status: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col selection:bg-[#D99B52]/25 dark:selection:bg-[#F2C594]/25">
      {/* Top Header */}
      <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 flex items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <KovaLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="font-mono tabular-nums text-xs text-[#D99B52] dark:text-[#F2C594] bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 rounded-md tracking-wider">
            {roomCode}
          </span>
        </div>
      </header>

      {/* Lobby Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-black/[0.04] dark:shadow-2xl dark:shadow-black/70">
          <div className="w-14 h-14 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-[#D99B52] dark:text-[#F2C594] mx-auto mb-5 shadow-inner">
            <Video size={22} strokeWidth={1.75} />
          </div>

          <h1 className="font-heading text-2xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
            {meeting ? meeting.title : "Meeting Lobby"}
          </h1>

          <p className="mt-2 text-xs text-[#6B6B70] dark:text-[#8E8E93]">
            Room Code:{" "}
            <span className="font-mono tabular-nums text-[#111113] dark:text-[#F5F5F7] bg-[#FAF9F6] dark:bg-[#09090B] px-2 py-0.5 rounded border border-black/[0.08] dark:border-white/[0.08]">
              {roomCode}
            </span>
          </p>

          {/* Camera / Mic preview box */}
          <div className="mt-6 p-6 bg-[#FAF9F6] dark:bg-[#09090B] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-3 text-[#6B6B70] dark:text-[#8E8E93]">
              <div className="p-2.5 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08]">
                <Camera size={16} strokeWidth={1.75} />
              </div>
              <div className="p-2.5 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08]">
                <Mic size={16} strokeWidth={1.75} />
              </div>
            </div>
            <p className="text-xs text-[#6B6B70] dark:text-[#8E8E93]">
              Ready to join. Audio and video devices will activate inside the room.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              <span>Return Home</span>
            </Link>

            <button
              type="button"
              className="px-5 py-2.5 text-xs font-semibold text-[#FAF9F6] bg-[#18181B] hover:bg-[#27272A] dark:text-[#09090B] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#D99B52]/50 dark:focus:ring-[#F2C594]/50 cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
            >
              Enter Meeting
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
