import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";

export async function PATCH(
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
      isLocked?: boolean;
      waitingRoomEnabled?: boolean;
      status?: "LIVE" | "ENDED";
    } = {};

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
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
        { error: "Only the meeting host can modify room settings" },
        { status: 403 }
      );
    }

    const updateData: {
      isLocked?: boolean;
      waitingRoomEnabled?: boolean;
      status?: "LIVE" | "ENDED";
    } = {};

    if (typeof body.isLocked === "boolean") {
      updateData.isLocked = body.isLocked;
    }
    if (typeof body.waitingRoomEnabled === "boolean") {
      updateData.waitingRoomEnabled = body.waitingRoomEnabled;
    }
    if (body.status === "LIVE" || body.status === "ENDED") {
      updateData.status = body.status;
    }

    const updated = await db.meeting.update({
      where: { id: meeting.id },
      data: updateData,
      select: {
        id: true,
        roomCode: true,
        isLocked: true,
        waitingRoomEnabled: true,
        status: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating meeting settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
