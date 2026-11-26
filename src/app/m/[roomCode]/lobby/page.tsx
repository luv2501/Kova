import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";
import { LobbyClient } from "@/components/lobby-client";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface LobbyPageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default async function LobbyPage({ params }: LobbyPageProps) {
  const { roomCode } = await params;
  const cleanCode = normalizeRoomCode(roomCode);

  const [meeting, session] = await Promise.all([
    db.meeting.findUnique({
      where: { roomCode: cleanCode },
      select: {
        id: true,
        title: true,
        roomCode: true,
        isLocked: true,
        waitingRoomEnabled: true,
        status: true,
        hostId: true,
      },
    }),
    auth(),
  ]);

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col">
        <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <KovaLogo size="md" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-8 text-center shadow-lg dark:shadow-2xl dark:shadow-black/60">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center text-[#EF4444] mx-auto mb-4">
              <AlertCircle size={20} strokeWidth={1.75} />
            </div>
            <h1 className="font-heading text-xl font-semibold tracking-[-0.025em]">
              Room not found
            </h1>
            <p className="mt-2 text-xs text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
              No meeting matches{" "}
              <span className="font-mono tabular-nums text-[#111113] dark:text-[#F5F5F7]">
                {cleanCode}
              </span>
              . Double-check your code or request a new invite link.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#FAF9F6] bg-[#18181B] hover:bg-[#27272A] dark:text-[#09090B] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] rounded-xl transition-all duration-150"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              <span>Return Home</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isHost = Boolean(
    session?.user?.id && meeting.hostId === session.user.id
  );

  return (
    <LobbyClient
      meeting={{
        id: meeting.id,
        title: meeting.title,
        roomCode: meeting.roomCode,
        isLocked: meeting.isLocked,
        waitingRoomEnabled: meeting.waitingRoomEnabled,
        status: meeting.status,
      }}
      isHost={isHost}
      defaultName={session?.user?.name || ""}
    />
  );
}
