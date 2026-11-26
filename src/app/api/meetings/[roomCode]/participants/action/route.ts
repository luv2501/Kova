import { NextResponse } from "next/server";
import { TrackType } from "livekit-server-sdk";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";
import { getRoomServiceClient } from "@/lib/livekit-server";

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
      targetIdentity?: string;
      action?: "MUTE" | "REMOVE";
      trackSid?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const targetIdentity = body.targetIdentity?.trim();
    if (
      !targetIdentity ||
      (body.action !== "MUTE" && body.action !== "REMOVE")
    ) {
      return NextResponse.json(
        { error: "targetIdentity and valid action (MUTE | REMOVE) required" },
        { status: 400 }
      );
    }

    const meeting = await db.meeting.findUnique({
      where: { roomCode: cleanCode },
      select: {
        id: true,
        roomCode: true,
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
        { error: "Only the meeting host can moderate participants" },
        { status: 403 }
      );
    }

    const rsc = getRoomServiceClient();
    if (!rsc) {
      return NextResponse.json(
        { error: "LiveKit server credentials are not configured" },
        { status: 500 }
      );
    }

    if (body.action === "REMOVE") {
      await rsc.removeParticipant(meeting.roomCode, targetIdentity);
      return NextResponse.json(
        { success: true, action: "REMOVE", targetIdentity },
        { status: 200 }
      );
    }

    // MUTE action
    if (body.trackSid) {
      await rsc.mutePublishedTrack(
        meeting.roomCode,
        targetIdentity,
        body.trackSid,
        true
      );
    } else {
      const participant = await rsc.getParticipant(
        meeting.roomCode,
        targetIdentity
      );
      const audioTracks = participant.tracks.filter(
        (t) => t.type === TrackType.AUDIO && !t.muted
      );
      await Promise.all(
        audioTracks.map((t) =>
          rsc.mutePublishedTrack(meeting.roomCode, targetIdentity, t.sid, true)
        )
      );
    }

    return NextResponse.json(
      { success: true, action: "MUTE", targetIdentity },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error executing participant action:", error);
    return NextResponse.json(
      { error: "Failed to moderate participant" },
      { status: 500 }
    );
  }
}
