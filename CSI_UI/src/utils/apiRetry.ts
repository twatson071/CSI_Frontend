/**
 * API Retry Mechanism with Exponential Backoff
 * Provides resilient API calls for air-gapped systems where backend might be temporarily unavailable
 */

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    const axiosError = error as { response?: { status?: number }; status?: number };
    if (!axiosError.response) return true; // Network error
    const status = axiosError.response?.status || axiosError.status;
    return typeof status === 'number' && (status >= 500 || status === 0);
  },
  onRetry: (error, attempt) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`API call failed, retry attempt ${attempt}:`, message);
  },
};

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  // Calculate exponential delay
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25% randomization)
  const jitter = cappedDelay * (0.75 + Math.random() * 0.5);
  
  return Math.round(jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    retryCondition,
    onRetry,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt > maxRetries || !retryCondition(error, attempt)) {
        throw error;
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier);
      
      // Notify retry handler
      onRetry(error, attempt);
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Axios interceptor for automatic retry
 */
interface AxiosError {
  config?: any;
  response?: { status?: number };
  status?: number;
}

export function createAxiosRetryInterceptor(axios: { interceptors: { response: { use: (onFulfilled: (response: unknown) => unknown, onRejected: (error: unknown) => Promise<unknown>) => void } } }, config: RetryConfig = {}) {
  axios.interceptors.response.use(
    (response: unknown) => response,
    async (error: unknown) => {
      const axiosError = error as AxiosError;
      const originalRequest = axiosError.config;
      
      // Prevent infinite loops
      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }
      
      // Mark request to prevent retry loops
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      const retryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        ...config,
        maxRetries: originalRequest.maxRetries ?? config.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries,
      };
      
      // Check if we should retry
      if (
        originalRequest._retryCount > retryConfig.maxRetries ||
        !retryConfig.retryCondition(error, originalRequest._retryCount)
      ) {
        return Promise.reject(error);
      }
      
      // Calculate delay
      const delay = calculateDelay(
        originalRequest._retryCount,
        retryConfig.initialDelay,
        retryConfig.maxDelay,
        retryConfig.backoffMultiplier
      );
      
      // Notify retry handler
      retryConfig.onRetry(error, originalRequest._retryCount);
      
      // Wait and retry
      await sleep(delay);
      return (axios as any)(originalRequest);
    }
  );
}

/**
 * Fetch wrapper with retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = {}
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);
    
    // Throw error for non-ok responses to trigger retry
    if (!response.ok && retryConfig.retryCondition) {
      const shouldRetry = retryConfig.retryCondition({ response }, 1);
      if (shouldRetry) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    
    return response;
  }, retryConfig);
}

/**
 * Circuit breaker pattern for API calls
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
    this.failures = 0;
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => {
        this.state = 'HALF_OPEN';
      }, this.resetTimeout);
    }
  }
  
  getState(): string {
    return this.state;
  }
}