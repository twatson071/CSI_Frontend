/**
 * useApiWithRetry Hook
 * Provides resilient API calls with retry logic for air-gapped systems
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { withRetry, RetryConfig, CircuitBreaker } from '../utils/apiRetry';

interface UseApiOptions extends RetryConfig {
  enableCircuitBreaker?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
  cacheTime?: number;
}

interface ApiState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  retryCount: number;
  lastFetchTime: number | null;
}

interface UseApiReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: (config?: AxiosRequestConfig) => Promise<T>;
  reset: () => void;
  retryCount: number;
  isStale: boolean;
  circuitBreakerState?: string;
}

// Create a configured axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Circuit breakers for different endpoints
const circuitBreakers = new Map<string, CircuitBreaker>();

export function useApiWithRetry<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    enableCircuitBreaker = true,
    circuitBreakerThreshold = 5,
    circuitBreakerTimeout = 60000,
    cacheTime = 300000, // 5 minutes default cache
    ...retryConfig
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
    retryCount: 0,
    lastFetchTime: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  // Get or create circuit breaker for this URL
  const getCircuitBreaker = useCallback(() => {
    if (!enableCircuitBreaker) return null;
    
    const key = new URL(url, window.location.origin).pathname;
    if (!circuitBreakers.has(key)) {
      circuitBreakers.set(
        key,
        new CircuitBreaker(circuitBreakerThreshold, circuitBreakerTimeout)
      );
    }
    return circuitBreakers.get(key)!;
  }, [url, enableCircuitBreaker, circuitBreakerThreshold, circuitBreakerTimeout]);

  // Check if cached data is stale
  const isStale = useCallback(() => {
    if (!state.lastFetchTime || !cacheTime) return true;
    return Date.now() - state.lastFetchTime > cacheTime;
  }, [state.lastFetchTime, cacheTime]);

  // Execute API call
  const execute = useCallback(async (config?: AxiosRequestConfig): Promise<T> => {
    // Check cache first
    if (cacheRef.current && !isStale()) {
      setState(prev => ({ ...prev, data: cacheRef.current!.data }));
      return cacheRef.current.data;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      retryCount: 0,
    }));

    try {
      const circuitBreaker = getCircuitBreaker();
      
      const apiCall = async () => {
        return withRetry(
          async () => {
            const response = await apiClient.request<T>({
              url,
              signal: abortControllerRef.current?.signal,
              ...config,
            });
            return response.data;
          },
          {
            ...retryConfig,
            onRetry: (error, attempt) => {
              setState(prev => ({ ...prev, retryCount: attempt }));
              retryConfig.onRetry?.(error, attempt);
            },
          }
        );
      };

      let data: T;
      if (circuitBreaker) {
        data = await circuitBreaker.execute(apiCall);
      } else {
        data = await apiCall();
      }

      // Update cache
      cacheRef.current = { data, timestamp: Date.now() };

      setState({
        data,
        error: null,
        loading: false,
        retryCount: 0,
        lastFetchTime: Date.now(),
      });

      return data;
    } catch (error) {
      const apiError = error as AxiosError;
      
      // Don't set error if request was cancelled
      if (apiError.code === 'ERR_CANCELED') {
        return Promise.reject(error);
      }

      setState(prev => ({
        ...prev,
        error: apiError,
        loading: false,
      }));

      throw error;
    }
  }, [url, getCircuitBreaker, retryConfig, isStale]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
      retryCount: 0,
      lastFetchTime: null,
    });
    cacheRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const circuitBreaker = getCircuitBreaker();

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    execute,
    reset,
    retryCount: state.retryCount,
    isStale: isStale(),
    circuitBreakerState: circuitBreaker?.getState(),
  };
}

// Hook for GET requests with automatic execution
export function useApiGet<T = any>(
  url: string,
  options: UseApiOptions & { enabled?: boolean } = {}
): UseApiReturn<T> {
  const { enabled = true, ...apiOptions } = options;
  const api = useApiWithRetry<T>(url, apiOptions);

  useEffect(() => {
    if (enabled && !api.data && !api.loading && !api.error) {
      api.execute({ method: 'GET' });
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return api;
}

// Hook for mutations (POST, PUT, DELETE)
export function useApiMutation<TData = any, TVariables = any>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  options: UseApiOptions = {}
): {
  mutate: (variables?: TVariables, config?: AxiosRequestConfig) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  loading: boolean;
  reset: () => void;
} {
  const api = useApiWithRetry<TData>(url, options);

  const mutate = useCallback(
    async (variables?: TVariables, config?: AxiosRequestConfig): Promise<TData> => {
      return api.execute({
        method,
        data: variables,
        ...config,
      });
    },
    [api, method]
  );

  return {
    mutate,
    data: api.data,
    error: api.error,
    loading: api.loading,
    reset: api.reset,
  };
}