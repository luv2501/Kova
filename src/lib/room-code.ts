export function generateRoomCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const segment = (length: number) =>
    Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment(3)}-${segment(3)}-${segment(3)}`;
}

export function normalizeRoomCode(input: string): string {
  const sanitized = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (sanitized.length === 9) {
    return `${sanitized.slice(0, 3)}-${sanitized.slice(3, 6)}-${sanitized.slice(6, 9)}`;
  }
  return input.trim().toLowerCase();
}
