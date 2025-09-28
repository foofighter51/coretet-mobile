import { useState, useCallback, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  progress?: number;
  message?: string;
}

export interface AsyncActions<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  setProgress: (progress: number, message?: string) => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export function useAsyncState<T = any>(initialData: T | null = null): [AsyncState<T>, AsyncActions<T>] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    progress: undefined,
    message: undefined
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const setProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message
    }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      isLoading: false,
      error: null
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      progress: undefined,
      message: undefined
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: isLoading ? null : prev.error,
      progress: isLoading ? 0 : undefined,
      message: isLoading ? undefined : prev.message
    }));
  }, []);

  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      data: initialData,
      isLoading: false,
      error: null,
      progress: undefined,
      message: undefined
    });
  }, [initialData]);

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        progress: 0,
        message: 'Starting...'
      }));

      const result = await asyncFn();

      // Only update state if not aborted
      if (!abortControllerRef.current.signal.aborted) {
        setState(prev => ({
          ...prev,
          data: result,
          isLoading: false,
          error: null,
          progress: 100,
          message: 'Complete'
        }));

        // Clear progress after a short delay
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            progress: undefined,
            message: undefined
          }));
        }, 1000);
      }

      return result;
    } catch (error) {
      // Only update state if not aborted
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          progress: undefined,
          message: undefined
        }));
      }

      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const actions: AsyncActions<T> = {
    execute,
    setProgress,
    setData,
    setError,
    setLoading,
    reset
  };

  return [state, actions];
}

export default useAsyncState;