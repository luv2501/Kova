"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateRoomCode } from "@/lib/room-code";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createInstantMeeting() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

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

  await db.meeting.create({
    data: {
      title: "Instant Meeting",
      roomCode,
      hostId: session.user.id,
      status: "LIVE",
      waitingRoomEnabled: false,
    },
  });

  redirect(`/m/${roomCode}/lobby`);
}

export async function scheduleMeeting(data: {
  title?: string;
  scheduledAt?: string;
  waitingRoomEnabled?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

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

  const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : null;
  const status =
    scheduledDate && scheduledDate > new Date() ? "SCHEDULED" : "LIVE";

  const meeting = await db.meeting.create({
    data: {
      title: data.title?.trim() || "Scheduled Meeting",
      roomCode,
      hostId: session.user.id,
      scheduledAt: scheduledDate,
      waitingRoomEnabled: Boolean(data.waitingRoomEnabled),
      status,
    },
  });

  revalidatePath("/dashboard");
  return meeting;
}
