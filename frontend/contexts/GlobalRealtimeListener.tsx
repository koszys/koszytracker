"use client";

import { useEffect, useRef } from "react";
import { usePublishEvents } from "@/hooks/usePublishEvents";
import { useToast } from "@/contexts/ToastContext";
import { usePathname } from "next/navigation";
import { GAME_CONFIG } from "@/config/games";
import type { PublishEvent } from "@/utils/eventBus";

export default function GlobalRealtimeListener() {
  const { toast, removeToast } = useToast();
  const pathname = usePathname();

  // Keep track of pending/unnotified events for games the user is not currently viewing
  const pendingEvents = useRef<Record<string, PublishEvent>>({});
  // Keep track of the active, unapplied event for the current page
  const unappliedEvent = useRef<PublishEvent | null>(null);

  // Parse the current active game context based on the URL pathname
  const segments = pathname.split("/").filter(Boolean);
  const isViewingWebsiteHome = segments.length === 0;

  const activeGameSlug = segments[0]; // e.g. "genshin", "wuwa"
  const activeGame = GAME_CONFIG.find((g) => g.id === activeGameSlug);
  const isViewingActiveGameHome = !!activeGame && segments.length === 1;

  // Determine current active page context ID
  const currentActiveId = isViewingWebsiteHome
    ? "main"
    : isViewingActiveGameHome && activeGame
    ? activeGame.id
    : null;

  const showRefreshToast = () => {
    toast(
      "The details of this page have been updated.",
      "info",
      0, // Persistent until manually refreshed, closed, or navigated away
      {
        label: "Refresh Page",
        onClick: () => {
          unappliedEvent.current = null;
          window.dispatchEvent(new Event("senti-refresh-active-game"));
        },
      },
      "senti-cms-update" // De-duplicate by passing a constant ID
    );
  };

  usePublishEvents((event) => {
    if (currentActiveId && event.gameId === currentActiveId) {
      // User is on the matching page, show it immediately
      unappliedEvent.current = event;
      showRefreshToast();
    } else {
      // User is on a different page, save event as pending for this game
      pendingEvents.current[event.gameId] = event;
    }
  });

  // Check for deferred events when the user navigates
  useEffect(() => {
    // If we have an active unapplied event for a different game/page context, move it back to pending
    if (unappliedEvent.current && unappliedEvent.current.gameId !== currentActiveId) {
      pendingEvents.current[unappliedEvent.current.gameId] = unappliedEvent.current;
      unappliedEvent.current = null;
      removeToast("senti-cms-update");
    }

    if (currentActiveId) {
      if (pendingEvents.current[currentActiveId]) {
        unappliedEvent.current = pendingEvents.current[currentActiveId];
        delete pendingEvents.current[currentActiveId];
        showRefreshToast();
      } else if (unappliedEvent.current) {
        showRefreshToast();
      }
    } else {
      // Navigated away from active game's Home or Website Home page: hide toast but keep unappliedEvent
      removeToast("senti-cms-update");
    }
  }, [pathname, currentActiveId, removeToast]);

  return null;
}
