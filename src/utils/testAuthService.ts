/**
 * Simple test authentication service for MVP development
 * Uses predefined phone numbers and 6-digit codes instead of SMS
 */

import { normalizePhoneNumber } from './phoneNumber';
import { RateLimiter } from './rateLimiter';
import { ErrorHandler, ErrorInfo } from './errorMessages';

export interface TestUser {
  phoneNumber: string;
  code: string;
  name: string;
  id: string;
}

export interface AuthSession {
  phoneNumber: string;
  code: string;
  isVerified: boolean;
  expiresAt: number;
}

export class TestAuthService {
  private static instance: TestAuthService;
  private testUsers: TestUser[] = [];
  private currentSession: AuthSession | null = null;
  private rateLimiter: RateLimiter;

  static getInstance(): TestAuthService {
    if (!TestAuthService.instance) {
      TestAuthService.instance = new TestAuthService();
    }
    return TestAuthService.instance;
  }

  constructor() {
    this.loadTestUsers();
    this.rateLimiter = RateLimiter.getInstance();
  }

  /**
   * Load test users from environment variables or use defaults
   */
  private loadTestUsers(): void {
    // Default test users
    const defaultUsers: TestUser[] = [
      { phoneNumber: '+13128411256', code: '128411', name: '', id: 'tester-1' },
      { phoneNumber: '+15624724359', code: '624724', name: '', id: 'tester-2' },
      { phoneNumber: '+17143301407', code: '143301', name: '', id: 'tester-3' },
      { phoneNumber: '+16509961770', code: '509961', name: '', id: 'tester-4' },
      { phoneNumber: '+15625870584', code: '625870', name: '', id: 'tester-5' },
      { phoneNumber: '+13104186365', code: '104186', name: '', id: 'tester-6' }
    ];

    // Try to load from environment variables
    const envTestCodes = import.meta.env.VITE_TEST_CODES;
    if (envTestCodes) {
      try {
        const codes = envTestCodes.split(',');
        this.testUsers = codes.map((codeEntry: string, index: number) => {
          const [phoneNumber, code] = codeEntry.split(':');
          return {
            phoneNumber: phoneNumber.trim(),
            code: code.trim(),
            name: '',
            id: `tester-${index + 1}`
          };
        });
      } catch (error) {
        console.warn('Failed to parse VITE_TEST_CODES, using defaults:', error);
        this.testUsers = defaultUsers;
      }
    } else {
      this.testUsers = defaultUsers;
    }

    console.log(`🧪 Test Auth Service initialized with ${this.testUsers.length} authorized testers`);
  }

  /**
   * Format phone number to standard format (now uses shared utility)
   */
  private formatPhoneNumber(phone: string): string {
    const formatted = normalizePhoneNumber(phone);
    console.log(`📞 Phone formatting: "${phone}" → "${formatted}"`);
    return formatted;
  }

  /**
   * Initiate phone verification (mock SMS sending)
   */
  async sendVerificationCode(phoneNumber: string): Promise<{
    success: boolean;
    message?: string;
    testCode?: string;
    error?: ErrorInfo;
  }> {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    // Check rate limiting first
    const rateLimitCheck = this.rateLimiter.checkAuthAttempt(formattedPhone, 'send_code');
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? this.rateLimiter.formatResetTime(rateLimitCheck.resetTime) : '15m';

      if (rateLimitCheck.reason?.includes('rapid')) {
        return {
          success: false,
          error: ErrorHandler.rateLimiting.burstLimit(resetTime)
        };
      } else if (rateLimitCheck.reason?.includes('phone number')) {
        return {
          success: false,
          error: ErrorHandler.rateLimiting.phoneRateLimit(resetTime)
        };
      } else {
        return {
          success: false,
          error: ErrorHandler.rateLimiting.sessionLimit(resetTime)
        };
      }
    }

    // Find test user
    const testUser = this.testUsers.find(u => u.phoneNumber === formattedPhone);

    if (!testUser) {
      return {
        success: false,
        error: ErrorHandler.phoneVerification.unauthorizedPhone()
      };
    }

    // Create session
    this.currentSession = {
      phoneNumber: formattedPhone,
      code: testUser.code,
      isVerified: false,
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };

    return {
      success: true,
      message: 'Verification code sent successfully',
      testCode: testUser.code // Include for easy testing
    };
  }

  /**
   * Verify the 6-digit code
   */
  async verifyCode(phoneNumber: string, code: string): Promise<{
    success: boolean;
    message?: string;
    user?: TestUser;
    error?: ErrorInfo;
  }> {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    console.log(`🔐 Verifying code: phone="${phoneNumber}" → "${formattedPhone}", code="${code}"`);

    // Check rate limiting first
    const rateLimitCheck = this.rateLimiter.checkAuthAttempt(formattedPhone, 'verify_code');
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? this.rateLimiter.formatResetTime(rateLimitCheck.resetTime) : '15m';

      if (rateLimitCheck.reason?.includes('rapid')) {
        return {
          success: false,
          error: ErrorHandler.rateLimiting.burstLimit(resetTime)
        };
      } else if (rateLimitCheck.reason?.includes('phone number')) {
        return {
          success: false,
          error: ErrorHandler.rateLimiting.phoneRateLimit(resetTime)
        };
      } else {
        return {
          success: false,
          error: ErrorHandler.rateLimiting.sessionLimit(resetTime)
        };
      }
    }

    if (!this.currentSession) {
      console.log(`❌ No active session`);
      return {
        success: false,
        error: ErrorHandler.codeVerification.noSession()
      };
    }

    console.log(`📱 Session: phone="${this.currentSession.phoneNumber}", code="${this.currentSession.code}"`);

    if (this.currentSession.phoneNumber !== formattedPhone) {
      console.log(`❌ Phone mismatch: session="${this.currentSession.phoneNumber}" vs input="${formattedPhone}"`);
      return {
        success: false,
        error: ErrorHandler.codeVerification.noSession()
      };
    }

    if (Date.now() > this.currentSession.expiresAt) {
      console.log(`❌ Session expired`);
      this.currentSession = null;
      return {
        success: false,
        error: ErrorHandler.codeVerification.expiredCode()
      };
    }

    if (this.currentSession.code !== code.trim()) {
      console.log(`❌ Code mismatch: session="${this.currentSession.code}" vs input="${code.trim()}"`);
      return {
        success: false,
        error: ErrorHandler.codeVerification.invalidCode()
      };
    }

    // Success - mark as verified and reset rate limiting for this phone
    this.currentSession.isVerified = true;
    this.rateLimiter.recordSuccess(formattedPhone);

    const testUser = this.testUsers.find(u => u.phoneNumber === formattedPhone);

    return {
      success: true,
      message: 'Phone number verified successfully',
      user: testUser
    };
  }

  /**
   * Get current session info
   */
  getCurrentSession(): AuthSession | null {
    if (this.currentSession && Date.now() > this.currentSession.expiresAt) {
      this.currentSession = null;
    }
    return this.currentSession;
  }

  /**
   * Clear current session (logout)
   */
  clearSession(): void {
    this.currentSession = null;
  }

  /**
   * Get all test users (for development/debugging)
   */
  getTestUsers(): TestUser[] {
    return [...this.testUsers];
  }

  /**
   * Check if we're in test mode
   */
  static isTestMode(): boolean {
    return import.meta.env.VITE_AUTH_MODE === 'test' ||
           import.meta.env.DEV || // Always use test mode in development
           !import.meta.env.VITE_SUPABASE_URL ||
           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
  }

  /**
   * Get remaining time for current session
   */
  getSessionTimeRemaining(): number {
    if (!this.currentSession) return 0;
    return Math.max(0, this.currentSession.expiresAt - Date.now());
  }

  /**
   * Format time remaining as MM:SS
   */
  formatTimeRemaining(): string {
    const remaining = this.getSessionTimeRemaining();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Update user name for current session
   */
  updateUserName(name: string): TestUser | null {
    if (!this.currentSession) return null;

    // Find and update the user
    const userIndex = this.testUsers.findIndex(u => u.phoneNumber === this.currentSession!.phoneNumber);
    if (userIndex === -1) return null;

    this.testUsers[userIndex].name = name.trim();
    console.log(`👤 Updated user name: "${name}"`);
    return this.testUsers[userIndex];
  }
}

export default TestAuthService;