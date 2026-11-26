import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";

export async function GET(
  _req: Request,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const cleanCode = normalizeRoomCode(roomCode);

    const meeting = await db.meeting.findUnique({
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
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    const session = await auth();
    const isHost = Boolean(
      session?.user?.id && meeting.hostId === session.user.id
    );

    return NextResponse.json(
      {
        ...meeting,
        isHost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching meeting metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
