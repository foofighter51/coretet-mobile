/**
 * Enhanced error handling for authentication operations
 */

import { ErrorInfo } from './errorMessages';

export interface AuthError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  userAction?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class AuthErrorHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };

  /**
   * Enhanced error parsing with categorization
   */
  static parseAuthError(error: any): AuthError {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';
    const errorCode = error?.code || error?.error_code || 'UNKNOWN';

    // Network-related errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorCode === 'NETWORK_ERROR') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection problem',
        retryable: true,
        userAction: 'Check your internet connection and try again'
      };
    }

    // Supabase-specific errors
    if (errorCode === 'invalid_grant' || errorMessage.includes('Invalid login credentials')) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or verification code',
        retryable: false,
        userAction: 'Double-check your email and verification code'
      };
    }

    if (errorCode === 'email_not_confirmed' || errorMessage.includes('email not confirmed')) {
      return {
        code: 'EMAIL_NOT_CONFIRMED',
        message: 'Email address not verified',
        retryable: false,
        userAction: 'Check your email and click the verification link'
      };
    }

    if (errorCode === 'too_many_requests' || errorMessage.includes('rate limit')) {
      return {
        code: 'RATE_LIMITED',
        message: 'Too many attempts',
        retryable: true,
        userAction: 'Please wait a few minutes before trying again'
      };
    }

    if (errorCode === 'signup_disabled' || errorMessage.includes('signup is disabled')) {
      return {
        code: 'SIGNUP_DISABLED',
        message: 'New signups are currently disabled',
        retryable: false,
        userAction: 'Contact support for access'
      };
    }

    // Token/session errors
    if (errorMessage.includes('JWT') || errorMessage.includes('token') || errorCode === 'invalid_token') {
      return {
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired',
        retryable: false,
        userAction: 'Please sign in again'
      };
    }

    // Email validation errors
    if (errorMessage.includes('invalid email') || errorCode === 'invalid_email') {
      return {
        code: 'INVALID_EMAIL',
        message: 'Invalid email address format',
        retryable: false,
        userAction: 'Enter a valid email address'
      };
    }

    // OTP-specific errors
    if (errorMessage.includes('invalid otp') || errorMessage.includes('otp expired')) {
      return {
        code: 'INVALID_OTP',
        message: 'Invalid or expired verification code',
        retryable: false,
        userAction: 'Request a new verification code'
      };
    }

    // Database connection errors
    if (errorMessage.includes('connection') || errorMessage.includes('database')) {
      return {
        code: 'DATABASE_ERROR',
        message: 'Database connection issue',
        retryable: true,
        userAction: 'Please try again in a moment'
      };
    }

    // Generic fallback
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      retryable: true,
      userAction: 'Please try again or contact support if the problem persists'
    };
  }

  /**
   * Convert AuthError to ErrorInfo for UI display
   */
  static toErrorInfo(authError: AuthError): ErrorInfo {
    return {
      title: this.getErrorTitle(authError.code),
      message: authError.message,
      action: authError.userAction || 'Please try again',
      type: authError.retryable ? 'warning' : 'error'
    };
  }

  private static getErrorTitle(code: string): string {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Connection Problem';
      case 'INVALID_CREDENTIALS':
        return 'Invalid Credentials';
      case 'EMAIL_NOT_CONFIRMED':
        return 'Email Not Verified';
      case 'RATE_LIMITED':
        return 'Too Many Attempts';
      case 'SIGNUP_DISABLED':
        return 'Signup Unavailable';
      case 'SESSION_EXPIRED':
        return 'Session Expired';
      case 'INVALID_EMAIL':
        return 'Invalid Email';
      case 'INVALID_OTP':
        return 'Invalid Code';
      case 'DATABASE_ERROR':
        return 'Service Temporarily Unavailable';
      default:
        return 'Something Went Wrong';
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config };
    let lastError: any;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error;
        const authError = this.parseAuthError(error);

        // Don't retry if error is not retryable
        if (!authError.retryable) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === finalConfig.maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        );

        console.log(`🔄 Retrying operation (attempt ${attempt + 1}/${finalConfig.maxAttempts}) after ${delay}ms`);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error indicates a temporary service issue
   */
  static isTemporaryError(error: any): boolean {
    const authError = this.parseAuthError(error);
    return authError.retryable && ['NETWORK_ERROR', 'DATABASE_ERROR', 'RATE_LIMITED'].includes(authError.code);
  }

  /**
   * Get user-friendly error message for logging
   */
  static getLogMessage(error: any): string {
    const authError = this.parseAuthError(error);
    return `[${authError.code}] ${authError.message}`;
  }
}