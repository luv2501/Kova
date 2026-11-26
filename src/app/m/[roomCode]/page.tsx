import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Video, ArrowLeft } from "lucide-react";

interface RoomPageProps {
  params: Promise<{
    roomCode: string;
  }>;
  searchParams: Promise<{
    guestToken?: string;
  }>;
}

export default async function RoomPage({
  params,
  searchParams,
}: RoomPageProps) {
  const { roomCode } = await params;
  const { guestToken } = await searchParams;
  const cleanCode = normalizeRoomCode(roomCode);

  const [meeting, session] = await Promise.all([
    db.meeting.findUnique({
      where: { roomCode: cleanCode },
      select: {
        id: true,
        title: true,
        roomCode: true,
        hostId: true,
        isLocked: true,
        waitingRoomEnabled: true,
        status: true,
      },
    }),
    auth(),
  ]);

  if (!meeting) {
    notFound();
  }

  const isHost = Boolean(
    session?.user?.id && meeting.hostId === session.user.id
  );

  // Enforce Waiting Room & Lock gate for non-host guests
  if (!isHost) {
    if (meeting.status === "ENDED" || meeting.isLocked) {
      redirect(`/m/${meeting.roomCode}/lobby`);
    }

    if (meeting.waitingRoomEnabled) {
      if (!guestToken) {
        redirect(`/m/${meeting.roomCode}/lobby`);
      }

      const guest = await db.waitingGuest.findUnique({
        where: { guestToken },
        select: {
          meetingId: true,
          status: true,
        },
      });

      if (
        !guest ||
        guest.meetingId !== meeting.id ||
        guest.status !== "ADMITTED"
      ) {
        redirect(`/m/${meeting.roomCode}/lobby`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col">
      <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 flex items-center justify-between">
        <Link
          href={isHost ? "/dashboard" : "/"}
          className="transition-opacity hover:opacity-90"
        >
          <KovaLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-xs text-[#B47B38] dark:text-[#F2C594] bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 rounded-md">
            {meeting.roomCode}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-8 text-center shadow-lg dark:shadow-2xl dark:shadow-black/60">
          <div className="w-12 h-12 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mx-auto mb-4">
            <Video size={20} strokeWidth={1.75} />
          </div>

          <h1 className="font-heading text-xl font-semibold tracking-[-0.025em]">
            {meeting.title}
          </h1>
          <p className="mt-2 text-xs text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
            {isHost
              ? "Entered as Host."
              : guestToken
                ? "Admitted via Waiting Room token."
                : "Entered open room."}{" "}
            Live WebRTC video call grid will initialize here in Step 5.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href={`/m/${meeting.roomCode}/lobby`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#111113] dark:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl transition-colors"
            >
              <ArrowLeft size={13} strokeWidth={1.75} />
              <span>Return to Lobby</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
