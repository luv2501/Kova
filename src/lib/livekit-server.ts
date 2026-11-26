import { RoomServiceClient } from "livekit-server-sdk";

export function getRoomServiceClient(): RoomServiceClient | null {
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  const rawUrl = (
    process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL
  )?.trim();

  if (!apiKey || !apiSecret || !rawUrl) {
    return null;
  }

  const httpUrl = rawUrl
    .replace(/^wss:\/\//i, "https://")
    .replace(/^ws:\/\//i, "http://");

  return new RoomServiceClient(httpUrl, apiKey, apiSecret);
}
