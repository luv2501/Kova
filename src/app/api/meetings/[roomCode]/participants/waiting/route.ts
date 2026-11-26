import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";

export async function GET(
  _req: Request,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { roomCode } = await context.params;
    const cleanCode = normalizeRoomCode(roomCode);

    const meeting = await db.meeting.findUnique({
      where: { roomCode: cleanCode },
      select: {
        id: true,
        hostId: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (meeting.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the meeting host can view waiting guests" },
        { status: 403 }
      );
    }

    const waitingGuests = await db.waitingGuest.findMany({
      where: {
        meetingId: meeting.id,
        status: "WAITING",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        guestName: true,
        guestToken: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ waitingGuests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching waiting guests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
