/**
 * Centralized error message handling with specific, actionable messages
 */

export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
  type: 'error' | 'warning' | 'info';
}

export class ErrorHandler {
  /**
   * Email verification errors
   */
  static phoneVerification = {
    emptyPhone: (): ErrorInfo => ({
      title: 'Email Required',
      message: 'Please enter your email address to continue.',
      action: 'Enter a valid email address like name@example.com',
      type: 'error'
    }),

    invalidFormat: (): ErrorInfo => ({
      title: 'Invalid Email Format',
      message: 'The email address format is not valid.',
      action: 'Use format: name@example.com',
      type: 'error'
    }),

    unauthorizedEmail: (): ErrorInfo => ({
      title: 'Email Not Authorized',
      message: 'This email address is not authorized for testing.',
      action: 'Contact your administrator for access or use an authorized email',
      type: 'error'
    }),

    sendCodeFailed: (): ErrorInfo => ({
      title: 'Could Not Send Code',
      message: 'There was a problem sending your verification code.',
      action: 'Check your email address and try again in a few moments',
      type: 'error'
    })
  };

  /**
   * Code verification errors
   */
  static codeVerification = {
    emptyCode: (): ErrorInfo => ({
      title: 'Verification Code Required',
      message: 'Please enter the 6-digit code sent to your email.',
      action: 'Check your email inbox or request a new code',
      type: 'error'
    }),

    invalidCode: (): ErrorInfo => ({
      title: 'Incorrect Code',
      message: 'The verification code you entered is not correct.',
      action: 'Double-check the code or request a new one',
      type: 'error'
    }),

    expiredCode: (): ErrorInfo => ({
      title: 'Code Expired',
      message: 'Your verification code has expired.',
      action: 'Request a new verification code',
      type: 'warning'
    }),

    noSession: (): ErrorInfo => ({
      title: 'Session Not Found',
      message: 'No active verification session found.',
      action: 'Start over by entering your email address',
      type: 'error'
    }),

    verificationFailed: (): ErrorInfo => ({
      title: 'Verification Failed',
      message: 'Could not verify your code due to a technical issue.',
      action: 'Try again or contact support if the problem persists',
      type: 'error'
    })
  };

  /**
   * Onboarding errors
   */
  static onboarding = {
    emptyName: (): ErrorInfo => ({
      title: 'Name Required',
      message: 'Please enter your name to continue.',
      action: 'Enter your first and last name',
      type: 'error'
    }),

    noActionSelected: (): ErrorInfo => ({
      title: 'Choose an Action',
      message: 'Please select whether you want to join or create a band.',
      action: 'Choose "Join a Band" or "Start a New Band"',
      type: 'error'
    }),

    saveFailed: (): ErrorInfo => ({
      title: 'Could Not Save Profile',
      message: 'There was a problem saving your information.',
      action: 'Try again or contact support if the issue persists',
      type: 'error'
    })
  };

  /**
   * Band creation errors
   */
  static bandCreation = {
    emptyBandName: (): ErrorInfo => ({
      title: 'Band Name Required',
      message: 'Please enter a name for your band.',
      action: 'Choose a unique name that represents your band',
      type: 'error'
    }),

    invalidPhoneNumber: (phoneNumber: string): ErrorInfo => ({
      title: 'Invalid Phone Number',
      message: `"${phoneNumber}" is not a valid phone number format.`,
      action: 'Use format: (555) 123-4567 or +1 555 123 4567',
      type: 'error'
    }),

    createFailed: (): ErrorInfo => ({
      title: 'Could Not Create Band',
      message: 'There was a problem creating your band.',
      action: 'Check your connection and try again',
      type: 'error'
    }),

    duplicateBandName: (): ErrorInfo => ({
      title: 'Band Name Taken',
      message: 'A band with this name already exists.',
      action: 'Choose a different name for your band',
      type: 'error'
    })
  };

  /**
   * Rate limiting errors
   */
  static rateLimiting = {
    tooManyAttempts: (resetTime: string): ErrorInfo => ({
      title: 'Too Many Attempts',
      message: 'You\'ve made too many authentication attempts.',
      action: `Please wait ${resetTime} before trying again`,
      type: 'warning'
    }),

    phoneRateLimit: (resetTime: string): ErrorInfo => ({
      title: 'Email Rate Limited',
      message: 'Too many attempts for this email address.',
      action: `Please wait ${resetTime} before trying again`,
      type: 'warning'
    }),

    burstLimit: (resetTime: string): ErrorInfo => ({
      title: 'Please Slow Down',
      message: 'You\'re making requests too quickly.',
      action: `Please wait ${resetTime} before trying again`,
      type: 'warning'
    }),

    sessionLimit: (resetTime: string): ErrorInfo => ({
      title: 'Session Rate Limited',
      message: 'Too many authentication attempts from this browser.',
      action: `Please wait ${resetTime} before trying again`,
      type: 'warning'
    })
  };

  /**
   * Band joining errors
   */
  static bandJoining = {
    emptyInviteCode: (): ErrorInfo => ({
      title: 'Invite Code Required',
      message: 'Please enter the 8-character invite code.',
      action: 'Ask your band leader for the invite code',
      type: 'error'
    }),

    invalidInviteCode: (): ErrorInfo => ({
      title: 'Invalid Invite Code',
      message: 'The invite code you entered does not exist.',
      action: 'Double-check the code with your band leader',
      type: 'error'
    }),

    notAuthorized: (bandName: string): ErrorInfo => ({
      title: 'Not Authorized',
      message: `You're not authorized to join "${bandName}".`,
      action: 'Ask the band creator to add your email address to the member list',
      type: 'error'
    }),

    alreadyMember: (bandName: string): ErrorInfo => ({
      title: 'Already a Member',
      message: `You're already a member of "${bandName}".`,
      action: 'No action needed - you can access this band anytime',
      type: 'info'
    }),

    joinFailed: (): ErrorInfo => ({
      title: 'Could Not Join Band',
      message: 'There was a problem joining the band.',
      action: 'Check your connection and try again',
      type: 'error'
    })
  };

  /**
   * Parse error from various sources and return appropriate ErrorInfo
   */
  static parseError(error: any, context: string): ErrorInfo {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';

    // Parse specific error patterns
    if (errorMessage.includes('Invalid invite code')) {
      return this.bandJoining.invalidInviteCode();
    }

    if (errorMessage.includes('Not authorized to join')) {
      const bandNameMatch = errorMessage.match(/join "(.+?)"/);
      const bandName = bandNameMatch ? bandNameMatch[1] : 'this band';
      return this.bandJoining.notAuthorized(bandName);
    }

    if (errorMessage.includes('already a member')) {
      const bandNameMatch = errorMessage.match(/of "(.+?)"/);
      const bandName = bandNameMatch ? bandNameMatch[1] : 'this band';
      return this.bandJoining.alreadyMember(bandName);
    }

    if (errorMessage.includes('Invalid verification code')) {
      return this.codeVerification.invalidCode();
    }

    if (errorMessage.includes('expired')) {
      return this.codeVerification.expiredCode();
    }

    if (errorMessage.includes('No active verification session')) {
      return this.codeVerification.noSession();
    }

    // Default fallback based on context
    switch (context) {
      case 'phoneVerification':
        return this.phoneVerification.sendCodeFailed();
      case 'codeVerification':
        return this.codeVerification.verificationFailed();
      case 'bandCreation':
        return this.bandCreation.createFailed();
      case 'bandJoining':
        return this.bandJoining.joinFailed();
      default:
        return {
          title: 'Something Went Wrong',
          message: errorMessage,
          action: 'Please try again or contact support if the problem persists',
          type: 'error'
        };
    }
  }
}