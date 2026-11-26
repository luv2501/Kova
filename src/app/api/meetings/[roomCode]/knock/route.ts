import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";

export async function POST(
  req: Request,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const cleanCode = normalizeRoomCode(roomCode);

    let body: { guestName?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const cleanName = body.guestName?.trim();
    if (!cleanName || cleanName.length > 80) {
      return NextResponse.json(
        { error: "Please provide a valid display name" },
        { status: 400 }
      );
    }

    const meeting = await db.meeting.findUnique({
      where: { roomCode: cleanCode },
      select: {
        id: true,
        isLocked: true,
        waitingRoomEnabled: true,
        status: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (meeting.status === "ENDED") {
      return NextResponse.json(
        { error: "This meeting has ended" },
        { status: 403 }
      );
    }

    if (meeting.isLocked) {
      return NextResponse.json(
        { error: "This meeting is locked by the host" },
        { status: 403 }
      );
    }

    if (!meeting.waitingRoomEnabled) {
      return NextResponse.json(
        { error: "Waiting room is not enabled for this meeting" },
        { status: 400 }
      );
    }

    const guestToken = crypto.randomUUID();

    const guest = await db.waitingGuest.create({
      data: {
        meetingId: meeting.id,
        guestName: cleanName,
        guestToken,
        status: "WAITING",
      },
      select: {
        id: true,
        guestToken: true,
        status: true,
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error("Error creating waiting guest knock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await context.params;
    const cleanCode = normalizeRoomCode(roomCode);

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Guest token is required" },
        { status: 400 }
      );
    }

    const guest = await db.waitingGuest.findUnique({
      where: { guestToken: token },
      select: {
        status: true,
        guestName: true,
        meeting: {
          select: {
            roomCode: true,
          },
        },
      },
    });

    if (!guest || guest.meeting.roomCode !== cleanCode) {
      return NextResponse.json(
        { error: "Guest request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: guest.status,
        guestName: guest.guestName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking waiting guest status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
