import crypto from "crypto";
import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeRoomCode } from "@/lib/room-code";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY?.trim();
    const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
    const serverUrl = (
      process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL
    )?.trim();

    const missingEnv: string[] = [];
    if (!apiKey) missingEnv.push("LIVEKIT_API_KEY");
    if (!apiSecret) missingEnv.push("LIVEKIT_API_SECRET");
    if (!serverUrl) missingEnv.push("NEXT_PUBLIC_LIVEKIT_URL / LIVEKIT_URL");

    if (missingEnv.length > 0 || !apiKey || !apiSecret || !serverUrl) {
      return NextResponse.json(
        {
          error: `LiveKit server environment variables missing: ${missingEnv.join(", ")}`,
        },
        { status: 500 }
      );
    }

    let body: {
      roomCode?: string;
      participantName?: string;
      guestToken?: string | null;
    } = {};

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    if (!body.roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const cleanCode = normalizeRoomCode(body.roomCode);

    const meeting = await db.meeting.findUnique({
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

    const session = await auth();
    const isHost = Boolean(
      session?.user?.id && meeting.hostId === session.user.id
    );

    const cleanGuestToken = body.guestToken?.trim() || null;
    let admittedGuestName: string | null = null;

    if (!isHost) {
      const guest = cleanGuestToken
        ? await db.waitingGuest.findUnique({
            where: { guestToken: cleanGuestToken },
            select: {
              meetingId: true,
              status: true,
              guestName: true,
            },
          })
        : null;

      const isAdmitted = Boolean(
        guest && guest.meetingId === meeting.id && guest.status === "ADMITTED"
      );

      if (meeting.waitingRoomEnabled && !isAdmitted) {
        return NextResponse.json(
          { error: "Waiting room admission required" },
          { status: 403 }
        );
      }

      if (meeting.isLocked && !isAdmitted) {
        return NextResponse.json(
          { error: "This meeting is locked by the host" },
          { status: 403 }
        );
      }

      if (isAdmitted && guest) {
        admittedGuestName = guest.guestName;
      }
    }

    // Mark meeting as LIVE when the host joins
    if (isHost && meeting.status !== "LIVE") {
      await db.meeting.update({
        where: { id: meeting.id },
        data: { status: "LIVE" },
      });
    }

    const displayName =
      body.participantName?.trim() ||
      admittedGuestName ||
      session?.user?.name?.trim() ||
      "Guest";

    const identity =
      session?.user?.id || cleanGuestToken || crypto.randomUUID();

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: displayName,
      metadata: JSON.stringify({ isHost }),
      ttl: "4h",
    });

    at.addGrant({
      roomJoin: true,
      room: meeting.roomCode,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
    });

    const token = await at.toJwt();

    if (typeof token !== "string" || !token.startsWith("eyJ")) {
      return NextResponse.json(
        { error: "Failed to sign a valid LiveKit access token" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        token,
        serverUrl,
        isHost,
        identity,
        participantName: displayName,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          roomCode: meeting.roomCode,
          isLocked: meeting.isLocked,
          waitingRoomEnabled: meeting.waitingRoomEnabled,
          status: isHost ? "LIVE" : meeting.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error minting LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
