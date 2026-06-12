import { PAYLOAD_API_URL } from "@/config/constants";
import type { GameEvent } from "@/data/types";

export async function fetchEvents(gameId: string): Promise<GameEvent[]> {
  try {
    const res = await fetch(
      `${PAYLOAD_API_URL}/events?where[gameId][equals]=${encodeURIComponent(gameId)}&where[isActive][equals]=true&sort=start&depth=2`
    );
    if (!res.ok) {
      console.warn(`fetchEvents failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const json = await res.json();
    return (json.docs as GameEvent[]) ?? [];
  } catch (err) {
    console.warn("fetchEvents error:", err);
    return [];
  }
}
