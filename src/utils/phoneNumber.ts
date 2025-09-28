/**
 * Phone number normalization utility
 * Ensures consistent phone number formatting across the application
 */

export function normalizePhoneNumber(phone: string): string {
  // Return empty string for empty input
  if (!phone || !phone.trim()) {
    return '';
  }

  let formatted: string;

  // Check if already formatted with +
  if (phone.startsWith('+')) {
    formatted = phone;
  } else {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Handle different input formats
    if (digits.length === 10 && !digits.startsWith('1')) {
      // 10 digits NOT starting with 1: local US number, add +1
      formatted = `+1${digits}`;
    } else if (digits.length === 10 && digits.startsWith('1')) {
      // 10 digits starting with 1: US number with country code, just add +
      formatted = `+${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      // 11 digits starting with 1: US number with country code
      formatted = `+${digits}`;
    } else {
      // Other cases: add + prefix
      formatted = `+${digits}`;
    }
  }

  return formatted;
}

/**
 * Validates if a phone number is in the expected format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Basic validation: starts with + and has at least 10 digits
  const phonePattern = /^\+\d{10,15}$/;
  return phonePattern.test(normalized);
}

/**
 * Formats phone number for display purposes
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);

  // Format US numbers as (XXX) XXX-XXXX
  if (normalized.startsWith('+1') && normalized.length === 12) {
    const digits = normalized.substring(2);
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }

  // Return normalized format for non-US or invalid numbers
  return normalized;
}