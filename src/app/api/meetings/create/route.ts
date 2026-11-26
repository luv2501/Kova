import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateRoomCode } from "@/lib/room-code";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body: {
      title?: string;
      scheduledAt?: string | null;
      waitingRoomEnabled?: boolean;
    } = {};

    try {
      body = await req.json();
    } catch {
      // Body may be empty for instant meetings
      body = {};
    }

    const { title, scheduledAt, waitingRoomEnabled } = body;

    // Generate unique room code with collision prevention
    let roomCode = generateRoomCode();
    let collision = await db.meeting.findUnique({
      where: { roomCode },
      select: { id: true },
    });

    let attempts = 0;
    while (collision && attempts < 10) {
      roomCode = generateRoomCode();
      collision = await db.meeting.findUnique({
        where: { roomCode },
        select: { id: true },
      });
      attempts++;
    }

    if (collision) {
      return NextResponse.json(
        { error: "Failed to allocate unique room code" },
        { status: 500 }
      );
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
    const status = scheduledDate && scheduledDate > new Date() ? "SCHEDULED" : "LIVE";

    const meeting = await db.meeting.create({
      data: {
        title: title?.trim() || "Instant Meeting",
        roomCode,
        hostId: session.user.id,
        scheduledAt: scheduledDate,
        waitingRoomEnabled: Boolean(waitingRoomEnabled),
        status,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
