import { PAYLOAD_API_URL } from "@/config/constants";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

import { createCacheFetcher } from "@/utils/cache";

async function fetchChangelogsRaw(gameId: string, isDraftMode: boolean): Promise<ChangelogEntry[]> {
  const url = `${PAYLOAD_API_URL}/changelogs?where[gameId][equals]=${encodeURIComponent(gameId)}&sort=-date&depth=2&limit=50${
    isDraftMode ? "&draft=true" : "&where[_status][equals]=published"
  }`;
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`fetchChangelogs failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const docs = json.docs ?? [];
  return docs.map((doc: Record<string, unknown>) => {
    const content = doc.content;
    const changes = extractRichTextChanges(content);
    return {
      version: (doc.title as string) ?? "Unknown",
      date: formatDate(doc.date as string),
      changes: changes.length > 0 ? changes : ["See details in admin panel"],
    };
  });
}

const cachedFetchChangelogs = createCacheFetcher(fetchChangelogsRaw);

export async function fetchChangelogs(gameId: string, isDraftMode: boolean = false): Promise<ChangelogEntry[]> {
  try {
    return await cachedFetchChangelogs(isDraftMode, gameId, isDraftMode);
  } catch (err) {
    console.warn("fetchChangelogs error:", err);
    return [];
  }
}

function extractRichTextChanges(content: unknown): string[] {
  if (!content) return [];
  if (typeof content === "string") return [content];
  const root = (content as Record<string, unknown>)?.root as Record<string, unknown> | undefined;
  if (!root?.children) return [];
  const children = root.children as Record<string, unknown>[];
  return children
    .map((child) => extractText(child))
    .filter((t): t is string => !!t);
}

function extractText(node: Record<string, unknown>): string | null {
  if (node.text && typeof node.text === "string") return node.text;
  if (node.children) {
    const children = node.children as Record<string, unknown>[];
    return children.map((c) => extractText(c)).filter(Boolean).join(" ");
  }
  return null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
