export function createCacheFetcher<Args extends any[], T>(
  fetchFn: (...args: Args) => Promise<T>,
) {
  const cache: Record<string, Promise<T>> = {};

  return async (isDraftMode: boolean, ...args: Args): Promise<T> => {
    if (typeof window === "undefined" || isDraftMode) {
      return fetchFn(...args);
    }

    const key = JSON.stringify(args);
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
