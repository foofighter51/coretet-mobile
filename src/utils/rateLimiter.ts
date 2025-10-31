/**
 * Client-side rate limiting to prevent authentication abuse
 * Tracks attempts per phone number and per session
 */

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: number;
  reason?: string;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private phoneAttempts: Map<string, AttemptRecord> = new Map();
  private sessionAttempts: AttemptRecord | null = null;

  // Rate limit configuration
  private readonly MAX_PHONE_ATTEMPTS = 5; // per phone number
  private readonly MAX_SESSION_ATTEMPTS = 10; // per browser session
  private readonly RESET_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly BURST_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_BURST_ATTEMPTS = 3; // within burst window

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.startCleanupTimer();
  }

  /**
   * Check if an authentication attempt is allowed
   */
  checkAuthAttempt(phoneNumber: string, type: 'send_code' | 'verify_code'): RateLimitResult {
    const now = Date.now();
    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    // Check session-level limits
    const sessionCheck = this.checkSessionLimit(now);
    if (!sessionCheck.allowed) {
      return sessionCheck;
    }

    // Check phone-number-specific limits
    const phoneCheck = this.checkPhoneLimit(normalizedPhone, now);
    if (!phoneCheck.allowed) {
      return phoneCheck;
    }

    // Check burst protection (rapid successive attempts)
    const burstCheck = this.checkBurstLimit(normalizedPhone, now);
    if (!burstCheck.allowed) {
      return burstCheck;
    }

    // All checks passed - record the attempt
    this.recordAttempt(normalizedPhone, now);

    return {
      allowed: true,
      remainingAttempts: this.getRemainingAttempts(normalizedPhone)
    };
  }

  /**
   * Record a successful authentication (resets phone-specific limits)
   */
  recordSuccess(phoneNumber: string): void {
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    this.phoneAttempts.delete(normalizedPhone);
    this.saveToStorage();
  }

  /**
   * Check session-level rate limits
   */
  private checkSessionLimit(now: number): RateLimitResult {
    if (!this.sessionAttempts) {
      return { allowed: true };
    }

    // Reset if window expired
    if (now - this.sessionAttempts.firstAttempt > this.RESET_WINDOW) {
      this.sessionAttempts = null;
      return { allowed: true };
    }

    if (this.sessionAttempts.count >= this.MAX_SESSION_ATTEMPTS) {
      const resetTime = this.sessionAttempts.firstAttempt + this.RESET_WINDOW;
      return {
        allowed: false,
        resetTime,
        reason: 'Too many authentication attempts from this browser. Please wait before trying again.'
      };
    }

    return { allowed: true };
  }

  /**
   * Check phone-number-specific rate limits
   */
  private checkPhoneLimit(normalizedPhone: string, now: number): RateLimitResult {
    const record = this.phoneAttempts.get(normalizedPhone);
    if (!record) {
      return { allowed: true };
    }

    // Reset if window expired
    if (now - record.firstAttempt > this.RESET_WINDOW) {
      this.phoneAttempts.delete(normalizedPhone);
      return { allowed: true };
    }

    if (record.count >= this.MAX_PHONE_ATTEMPTS) {
      const resetTime = record.firstAttempt + this.RESET_WINDOW;
      return {
        allowed: false,
        resetTime,
        reason: 'Too many attempts for this phone number. Please wait before trying again.'
      };
    }

    return { allowed: true };
  }

  /**
   * Check burst protection (prevents rapid-fire attempts)
   */
  private checkBurstLimit(normalizedPhone: string, now: number): RateLimitResult {
    const record = this.phoneAttempts.get(normalizedPhone);
    if (!record) {
      return { allowed: true };
    }

    // Check if we're within burst window and have too many attempts
    const timeSinceFirst = now - record.firstAttempt;
    if (timeSinceFirst < this.BURST_WINDOW && record.count >= this.MAX_BURST_ATTEMPTS) {
      const resetTime = record.firstAttempt + this.BURST_WINDOW;
      return {
        allowed: false,
        resetTime,
        reason: 'Too many rapid attempts. Please wait a moment before trying again.'
      };
    }

    return { allowed: true };
  }

  /**
   * Record an authentication attempt
   */
  private recordAttempt(normalizedPhone: string, now: number): void {
    // Record session attempt
    if (!this.sessionAttempts) {
      this.sessionAttempts = { count: 1, firstAttempt: now, lastAttempt: now };
    } else {
      this.sessionAttempts.count++;
      this.sessionAttempts.lastAttempt = now;
    }

    // Record phone-specific attempt
    const existing = this.phoneAttempts.get(normalizedPhone);
    if (!existing) {
      this.phoneAttempts.set(normalizedPhone, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      existing.count++;
      existing.lastAttempt = now;
    }

    this.saveToStorage();
  }

  /**
   * Get remaining attempts for a phone number
   */
  private getRemainingAttempts(normalizedPhone: string): number {
    const record = this.phoneAttempts.get(normalizedPhone);
    if (!record) return this.MAX_PHONE_ATTEMPTS;
    return Math.max(0, this.MAX_PHONE_ATTEMPTS - record.count);
  }

  /**
   * Format reset time as human-readable string
   */
  formatResetTime(resetTime: number): string {
    const remaining = Math.max(0, resetTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Save rate limit data to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        phoneAttempts: Object.fromEntries(this.phoneAttempts),
        sessionAttempts: this.sessionAttempts,
        timestamp: Date.now()
      };
      localStorage.setItem('coretet-rate-limits', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save rate limit data:', error);
    }
  }

  /**
   * Load rate limit data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('coretet-rate-limits');
      if (!stored) return;

      const data = JSON.parse(stored);
      const now = Date.now();

      // Only load recent data (within 24 hours)
      if (now - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('coretet-rate-limits');
        return;
      }

      // Restore phone attempts
      if (data.phoneAttempts) {
        this.phoneAttempts = new Map(Object.entries(data.phoneAttempts));
      }

      // Restore session attempts
      if (data.sessionAttempts) {
        this.sessionAttempts = data.sessionAttempts;
      }

    } catch (error) {
      console.warn('Failed to load rate limit data:', error);
      localStorage.removeItem('coretet-rate-limits');
    }
  }

  /**
   * Clean up expired records periodically
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      // Clean phone attempts
      for (const [phone, record] of this.phoneAttempts.entries()) {
        if (now - record.firstAttempt > this.RESET_WINDOW) {
          this.phoneAttempts.delete(phone);
          cleaned++;
        }
      }

      // Clean session attempts
      if (this.sessionAttempts && now - this.sessionAttempts.firstAttempt > this.RESET_WINDOW) {
        this.sessionAttempts = null;
        cleaned++;
      }

      if (cleaned > 0) {
        this.saveToStorage();
      }
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  /**
   * Clear all rate limiting data (for testing/admin use)
   */
  clearAll(): void {
    this.phoneAttempts.clear();
    this.sessionAttempts = null;
    localStorage.removeItem('coretet-rate-limits');
  }
}