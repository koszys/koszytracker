export type PublishEvent = {
  collection: string;
  gameId: string;
  docId: string | number;
  operation: "create" | "update" | "delete";
};

type Listener = (event: PublishEvent) => void;

// Back the listeners Set on globalThis to share it across multiple compilation contexts
// (e.g. Next.js App Router, server actions, client pages, API routes) and survive HMR.
const globalWithListeners = globalThis as typeof globalThis & {
  __payloadPublishEventListeners?: Set<Listener>;
};

if (!globalWithListeners.__payloadPublishEventListeners) {
  globalWithListeners.__payloadPublishEventListeners = new Set<Listener>();
}

const listeners = globalWithListeners.__payloadPublishEventListeners;

export function emitPublishEvent(event: PublishEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      console.error("Error in publish event listener:", err);
    }
  }
}

export function subscribePublishEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

