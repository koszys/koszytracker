import { PAYLOAD_API_URL } from "@/config/constants";
import type { GameCode } from "@/data/types";
import { createCacheFetcher } from "@/utils/cache";

async function fetchCodesRaw(gameId: string, isDraftMode: boolean): Promise<GameCode[]> {
  const url = `${PAYLOAD_API_URL}/game-codes?where[gameId][equals]=${encodeURIComponent(gameId)}&sort=-createdAt${
    isDraftMode ? "&draft=true" : "&where[_status][equals]=published"
  }`;
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`fetchCodes failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return (json.docs as GameCode[]) ?? [];
}

const cachedFetchCodes = createCacheFetcher(fetchCodesRaw);

export async function fetchCodes(gameId: string, isDraftMode: boolean = false, force: boolean = false): Promise<GameCode[]> {
  try {
    return await cachedFetchCodes({ isDraftMode, force }, gameId, isDraftMode);
  } catch (err) {
    console.warn("fetchCodes error:", err);
    return [];
  }
}
