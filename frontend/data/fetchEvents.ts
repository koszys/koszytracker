import { PAYLOAD_API_URL } from "@/config/constants";
import type { GameEvent } from "@/data/types";
import { createCacheFetcher } from "@/utils/cache";

async function fetchEventsRaw(gameId: string, isDraftMode: boolean): Promise<GameEvent[]> {
  const url = `${PAYLOAD_API_URL}/events?where[gameId][equals]=${encodeURIComponent(gameId)}&where[isActive][equals]=true&sort=start&depth=2${
    isDraftMode ? "&draft=true" : ""
  }`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`fetchEvents failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return (json.docs as GameEvent[]) ?? [];
}

const cachedFetchEvents = createCacheFetcher(fetchEventsRaw);

export async function fetchEvents(gameId: string, isDraftMode: boolean = false): Promise<GameEvent[]> {
  try {
    return await cachedFetchEvents(isDraftMode, gameId, isDraftMode);
  } catch (err) {
    console.warn("fetchEvents error:", err);
    return [];
  }
}
