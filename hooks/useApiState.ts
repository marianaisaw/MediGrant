/**
 * Custom hook for managing API state
 * Provides loading, error, and data states for API calls
 */

import { useState, useCallback } from 'react';

type ApiState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  setData: (data: T) => void;
  startLoading: () => void;
  setError: (error: Error) => void;
  reset: () => void;
};

export function useApiState<T>(initialData: T | null = null): ApiState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const handleSetData = useCallback((newData: T) => {
    setData(newData);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    setData: handleSetData,
    startLoading,
    setError: handleError,
    reset
  };
}
