import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";

export async function POST(
  req: Request,
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

    let body: {
      guestId?: string;
      action?: "ADMIT" | "REJECT";
    } = {};

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    if (
      !body.guestId ||
      (body.action !== "ADMIT" && body.action !== "REJECT")
    ) {
      return NextResponse.json(
        { error: "guestId and valid action (ADMIT | REJECT) are required" },
        { status: 400 }
      );
    }

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
        { error: "Only the meeting host can admit or reject guests" },
        { status: 403 }
      );
    }

    const existingGuest = await db.waitingGuest.findFirst({
      where: {
        id: body.guestId,
        meetingId: meeting.id,
      },
      select: { id: true },
    });

    if (!existingGuest) {
      return NextResponse.json(
        { error: "Waiting guest not found in this room" },
        { status: 404 }
      );
    }

    const updated = await db.waitingGuest.update({
      where: { id: body.guestId },
      data: {
        status: body.action === "ADMIT" ? "ADMITTED" : "REJECTED",
      },
      select: {
        id: true,
        guestName: true,
        status: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error moderating waiting guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
