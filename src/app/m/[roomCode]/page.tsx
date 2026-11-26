import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";
import { VideoRoomClient } from "@/components/video-room-client";

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

  // Enforce Waiting Room & Lock gate for non-host participants
  if (!isHost) {
    if (meeting.status === "ENDED") {
      redirect(`/m/${meeting.roomCode}/lobby`);
    }

    const guest = guestToken
      ? await db.waitingGuest.findUnique({
          where: { guestToken },
          select: {
            meetingId: true,
            status: true,
          },
        })
      : null;

    const isAdmitted = Boolean(
      guest && guest.meetingId === meeting.id && guest.status === "ADMITTED"
    );

    if (meeting.waitingRoomEnabled && !isAdmitted) {
      redirect(`/m/${meeting.roomCode}/lobby`);
    }

    if (meeting.isLocked && !isAdmitted) {
      redirect(`/m/${meeting.roomCode}/lobby`);
    }
  }

  return (
    <VideoRoomClient
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
      guestToken={guestToken || null}
    />
  );
}
