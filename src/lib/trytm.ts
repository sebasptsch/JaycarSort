export const trytm = async <T, E extends Error = Error>(
  promise: Promise<T>,
): Promise<[T, null] | [null, E]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (throwable) {
    if (throwable instanceof Error) return [null, throwable as E];

    throw throwable;
  }
};