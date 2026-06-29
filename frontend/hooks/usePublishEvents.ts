import { useEffect, useRef } from "react";

import type { PublishEvent } from "@/utils/eventBus";

type Callback = (event: PublishEvent) => void;

const callbacks = new Set<(event: PublishEvent) => void>();

let sharedSource: EventSource | null = null;
let subscriberCount = 0;

function ensureSource() {
  if (sharedSource) return;

  sharedSource = new EventSource("/api/sse");

  sharedSource.onmessage = (e) => {
    try {
      const event: PublishEvent = JSON.parse(e.data);
      callbacks.forEach((cb) => cb(event));
    } catch {
      // ignore malformed events
    }
  };

  sharedSource.onerror = () => {
    sharedSource?.close();
    sharedSource = null;
    subscriberCount = 0;
    callbacks.clear();
  };
}

function closeSource() {
  if (sharedSource) {
    sharedSource.close();
    sharedSource = null;
  }
}

export function usePublishEvents(onEvent: Callback) {
  const callbackRef = useRef(onEvent);

  useEffect(() => {
    callbackRef.current = onEvent;
  });

  useEffect(() => {
    subscriberCount++;
    const cb = (event: PublishEvent) => {
      callbackRef.current(event);
    };
    callbacks.add(cb);
    ensureSource();

    return () => {
      callbacks.delete(cb);
      subscriberCount--;
      if (subscriberCount === 0) {
        closeSource();
      }
    };
  }, []);
}
