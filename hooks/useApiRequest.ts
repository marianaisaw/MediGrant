import { useState, useCallback } from "react";

export function useApiRequest<T = any>(
  apiFn: (...args: any[]) => Promise<T>,
  opts?: { onSuccess?: (data: T) => void; onError?: (err: any) => void }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const request = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        opts?.onSuccess?.(result);
        return result;
      } catch (e: any) {
        setError(e?.message || "Unknown error");
        opts?.onError?.(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [apiFn, opts]
  );

  return { loading, error, data, request };
}
