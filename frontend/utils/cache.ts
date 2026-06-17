type CacheEntry<T> = {
  promise: Promise<T>;
  timestamp: number;
};

export function createCacheFetcher<Args extends any[], T>(
  fetchFn: (...args: Args) => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
) {
  const cache: Record<string, CacheEntry<T>> = {};

  return async (isDraftMode: boolean, ...args: Args): Promise<T> => {
    // If running on server or in draft mode, bypass cache
    if (typeof window === "undefined" || isDraftMode) {
      return fetchFn(...args);
    }

    const key = JSON.stringify(args);
    const cached = cache[key];
    const now = Date.now();

    if (cached && now - cached.timestamp < ttlMs) {
      return cached.promise;
    }

    const promise = (async () => {
      try {
        return await fetchFn(...args);
      } catch (err) {
        delete cache[key];
        throw err;
      }
    })();

    cache[key] = {
      promise,
      timestamp: now,
    };

    return promise;
  };
}
