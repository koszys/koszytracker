const caches = new Set<Record<string, unknown>>();

export function clearAllCaches() {
  for (const cache of caches) {
    Object.keys(cache).forEach((key) => delete cache[key]);
  }
}

export function createCacheFetcher<Args extends any[], T>(
  fetchFn: (...args: Args) => Promise<T>,
) {
  const cache: Record<string, Promise<T>> = {};
  caches.add(cache as Record<string, unknown>);

  return async (
    options: boolean | { isDraftMode?: boolean; force?: boolean },
    ...args: Args
  ): Promise<T> => {
    const isDraftMode = typeof options === "boolean" ? options : !!options.isDraftMode;
    const force = typeof options === "boolean" ? false : !!options.force;

    if (typeof window === "undefined" || isDraftMode) {
      return fetchFn(...args);
    }

    const key = JSON.stringify(args);
    if (force) {
      delete cache[key];
    }

    if (key in cache) {
      return cache[key];
    }

    const promise = fetchFn(...args).catch((err) => {
      delete cache[key];
      throw err;
    });

    cache[key] = promise;
    return promise;
  };
}

