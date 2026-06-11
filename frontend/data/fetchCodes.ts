import { PAYLOAD_API_URL } from "@/config/constants";
import type { GameCode } from "@/data/types";

export async function fetchCodes(gameId: string): Promise<GameCode[]> {
  try {
    const res = await fetch(
      `${PAYLOAD_API_URL}/game-codes?where[gameId][equals]=${encodeURIComponent(gameId)}&sort=-createdAt`
    );
    if (!res.ok) {
      console.warn(`fetchCodes failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const json = await res.json();
    return (json.docs as GameCode[]) ?? [];
  } catch (err) {
    console.warn("fetchCodes error:", err);
    return [];
  }
}
