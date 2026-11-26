import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const rawMeetings = await db.meeting.findMany({
    where: {
      hostId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          waitingGuests: true,
        },
      },
    },
  });

  const meetings = rawMeetings.map((m) => ({
    id: m.id,
    title: m.title,
    roomCode: m.roomCode,
    status: m.status,
    isLocked: m.isLocked,
    waitingRoomEnabled: m.waitingRoomEnabled,
    scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    _count: m._count,
  }));

  const dbUser = !session.user.image
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { image: true, name: true },
      })
    : null;

  return (
    <DashboardClient
      user={{
        name: session.user.name ?? dbUser?.name,
        email: session.user.email,
        image: session.user.image ?? dbUser?.image,
      }}
      initialMeetings={meetings}
    />
  );
}
