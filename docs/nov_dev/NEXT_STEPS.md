# Next Steps - Week 1 Development

**Status**: ✅ Database migrations complete | ✅ Files organized
**Start Date**: Nov 25, 2025
**Goal**: Create foundation code (constants, utilities, services)

---

## 📍 Where We Are

### ✅ Completed (Nov 24)
- Database migrations applied (6 migrations)
- TypeScript types regenerated
- File organization consolidated
- Documentation complete
- Git commits clean

### 📊 Current State
- **12 users**: All 'free' tier with 1GB storage
- **20 bands**: All 25GB storage
- **120 SMS credits**: Allocated and ready
- **Storage tracking**: Automated via triggers
- **SMS infrastructure**: 4 new tables created

---

## 🎯 Week 1 Tasks (Nov 25-29)

### Day 1: Constants & Type Definitions

**1. Create Tier Constants**
```bash
touch src/constants/tiers.ts
```

**Implementation**:
```typescript
// src/constants/tiers.ts
export const TIERS = {
  FREE: {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    storage: 1_073_741_824, // 1GB in bytes
    bandsAllowed: 0,
    smsCreditsPerMonth: 10,
    features: [
      'Personal workspace',
      '1GB storage',
      '10 SMS shares/month',
      'Basic collaboration'
    ]
  },
  BAND: {
    id: 'band' as const,
    name: 'Band',
    price: 5, // Will increase to $10
    storage: 26_843_545_600, // 25GB in bytes
    bandsAllowed: 1,
    smsCreditsPerMonth: 50,
    maxMembersPerBand: 10,
    features: [
      'Personal workspace + 1 band',
      '25GB band storage',
      '50 SMS shares/month',
      '10 members per band',
      'Full collaboration features'
    ]
  },
  PRODUCER: {
    id: 'producer' as const,
    name: 'Producer',
    price: -1, // Waitlist only
    storage: -1, // Unlimited
    bandsAllowed: -1, // Unlimited
    smsCreditsPerMonth: 200,
    maxMembersPerBand: -1, // Unlimited
    features: [
      'Unlimited bands',
      'Unlimited storage',
      '200 SMS shares/month',
      'Unlimited members',
      'Priority support',
      'Advanced analytics'
    ]
  }
} as const;

export type TierId = keyof typeof TIERS;
export type Tier = typeof TIERS[TierId];

// Helper functions
export const getTierById = (id: TierId): Tier => TIERS[id];

export const canCreateBand = (tier: TierId, currentBands: number): boolean => {
  const tierConfig = TIERS[tier];
  return tierConfig.bandsAllowed === -1 || currentBands < tierConfig.bandsAllowed;
};

export const hasStorageAvailable = (tier: TierId, used: number, fileSize: number): boolean => {
  const tierConfig = TIERS[tier];
  if (tierConfig.storage === -1) return true; // Unlimited
  return (used + fileSize) <= tierConfig.storage;
};

export const formatStorage = (bytes: number): string => {
  if (bytes === -1) return 'Unlimited';
  const gb = bytes / 1_073_741_824;
  return `${gb.toFixed(gb < 1 ? 2 : 0)}GB`;
};

export const getStoragePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0; // Unlimited
  return Math.min(100, (used / limit) * 100);
};
```

**Testing**:
```bash
# Create test file
touch src/constants/__tests__/tiers.test.ts

# Run tests
npm test tiers.test.ts
```

---

**2. Create Phone Utilities**
```bash
touch src/utils/phone.ts
npm install libphonenumber-js
```

**Implementation**:
```typescript
// src/utils/phone.ts
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { createHash } from 'crypto';

/**
 * Normalize phone number to E.164 format
 * @param phone - Raw phone input (e.g., "(555) 123-4567", "555-123-4567")
 * @param defaultCountry - Default country code if not provided (default: 'US')
 * @returns E.164 formatted phone (e.g., "+15551234567") or null if invalid
 */
export const normalizePhoneNumber = (
  phone: string,
  defaultCountry: CountryCode = 'US'
): string | null => {
  try {
    if (!phone || phone.trim() === '') return null;

    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    if (!phoneNumber || !phoneNumber.isValid()) return null;

    return phoneNumber.format('E.164');
  } catch (error) {
    console.error('Phone normalization error:', error);
    return null;
  }
};

/**
 * Format phone number for display
 * @param phone - E.164 phone number (e.g., "+15551234567")
 * @returns Formatted phone (e.g., "(555) 123-4567") or original if invalid
 */
export const formatPhoneForDisplay = (phone: string): string => {
  try {
    if (!phone) return '';

    const phoneNumber = parsePhoneNumber(phone);
    if (!phoneNumber) return phone;

    return phoneNumber.formatNational();
  } catch (error) {
    return phone;
  }
};

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @param defaultCountry - Default country code (default: 'US')
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (
  phone: string,
  defaultCountry: CountryCode = 'US'
): boolean => {
  try {
    return isValidPhoneNumber(phone, defaultCountry);
  } catch (error) {
    return false;
  }
};

/**
 * Hash phone number for privacy (SHA-256)
 * Used for playlist_access_grants.phone_number_hash
 * @param phone - E.164 phone number
 * @returns SHA-256 hash as hex string
 */
export const hashPhoneNumber = (phone: string): string => {
  return createHash('sha256').update(phone).digest('hex');
};

/**
 * Extract country code from E.164 phone
 * @param phone - E.164 phone number (e.g., "+15551234567")
 * @returns Country code (e.g., "US") or null
 */
export const getPhoneCountry = (phone: string): string | null => {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    return phoneNumber?.country || null;
  } catch (error) {
    return null;
  }
};
```

**Testing**:
```bash
touch src/utils/__tests__/phone.test.ts
npm test phone.test.ts
```

---

### Day 2: Access Codes & Storage Utils

**3. Create Access Code Generator**
```bash
touch src/utils/accessCodes.ts
```

**Implementation**:
```typescript
// src/utils/accessCodes.ts

/**
 * Generate 6-digit SMS access code
 * @returns 6-digit string (e.g., "123456")
 */
export const generateAccessCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate access code format
 * @param code - Access code to validate
 * @returns true if valid format (6 digits)
 */
export const validateAccessCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Format access code for display (e.g., "123 456")
 * @param code - Raw access code
 * @returns Formatted code with space
 */
export const formatAccessCode = (code: string): string => {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)} ${code.slice(3)}`;
};

/**
 * Generate share token (UUID-like)
 * @returns Unique share token
 */
export const generateShareToken = (): string => {
  return crypto.randomUUID();
};

/**
 * Check if access code has expired
 * @param expiresAt - ISO timestamp of expiration
 * @returns true if expired
 */
export const isAccessCodeExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false; // No expiration
  return new Date(expiresAt) < new Date();
};
```

---

**4. Create Storage Utilities**
```bash
touch src/utils/storage.ts
```

**Implementation**:
```typescript
// src/utils/storage.ts

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 GB")
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === -1) return 'Unlimited';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Calculate storage percentage used
 * @param used - Bytes used
 * @param limit - Bytes limit
 * @returns Percentage (0-100)
 */
export const getStoragePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, (used / limit) * 100);
};

/**
 * Check if storage is low (< 10% remaining)
 * @param used - Bytes used
 * @param limit - Bytes limit
 * @returns true if low storage
 */
export const isStorageLow = (used: number, limit: number): boolean => {
  return getStoragePercentage(used, limit) > 90;
};

/**
 * Check if storage is full (>= 100%)
 * @param used - Bytes used
 * @param limit - Bytes limit
 * @returns true if full
 */
export const isStorageFull = (used: number, limit: number): boolean => {
  if (limit === -1) return false; // Unlimited
  return used >= limit;
};

/**
 * Calculate remaining storage
 * @param used - Bytes used
 * @param limit - Bytes limit
 * @returns Remaining bytes (-1 if unlimited)
 */
export const getRemainingStorage = (used: number, limit: number): number => {
  if (limit === -1) return -1; // Unlimited
  return Math.max(0, limit - used);
};
```

---

### Day 3-4: Services Layer

**5. Create Storage Service**
```bash
touch src/services/storage.ts
```

**Implementation**: See [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) Section 4.1

**Key functions**:
- `checkStorageAvailable(userId, fileSize)` - Pre-upload validation
- `getUserStorageStats(userId)` - Current usage statistics
- `getBandStorageStats(bandId)` - Band usage statistics
- `enforceStorageLimit(userId, fileSize)` - Throw error if exceeds

---

**6. Create Tier Enforcement Service**
```bash
touch src/services/tiers.ts
```

**Implementation**: See [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) Section 4.2

**Key functions**:
- `canUploadFile(userId, fileSize)` - Combined tier + storage check
- `canCreateBand(userId)` - Check band tier limits
- `canSendSMS(userId)` - Check SMS credits
- `getRemainingCredits(userId)` - Current SMS balance
- `getUserTierInfo(userId)` - Complete tier information

---

### Day 5: Testing & Documentation

**7. Unit Tests**
```bash
npm test src/constants/
npm test src/utils/
npm test src/services/
```

**8. Integration Tests**
- Test storage triggers (upload → storage increases)
- Test storage triggers (delete → storage decreases)
- Test tier enforcement (free user cannot create band)
- Test SMS credits (free user has 10 credits)

---

## 📚 Reference Documents

While implementing, refer to:
- [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) - Detailed implementation specs
- [USER_IDENTITY_AND_AUTH.md](./USER_IDENTITY_AND_AUTH.md) - Auth flows
- [CoreTet_SMS_Sharing_System.md](./CoreTet_SMS_Sharing_System.md) - SMS technical design
- [../../lib/database.types.ts](../../lib/database.types.ts) - TypeScript types

---

## ✅ Definition of Done (Week 1)

By Friday Nov 29, you should have:

- [ ] `src/constants/tiers.ts` - Complete tier definitions
- [ ] `src/utils/phone.ts` - Phone normalization, formatting, validation, hashing
- [ ] `src/utils/accessCodes.ts` - Access code generation and validation
- [ ] `src/utils/storage.ts` - Storage formatting and calculations
- [ ] `src/services/storage.ts` - Storage checks and enforcement
- [ ] `src/services/tiers.ts` - Tier-based feature gating
- [ ] Unit tests for all utilities (>80% coverage)
- [ ] Integration tests for storage triggers
- [ ] Documentation comments (JSDoc)
- [ ] Git commits with descriptive messages

---

## 🚀 After Week 1

**Week 2 Preview** (Dec 2-6):
- Update sign-up form (add phone field)
- Build phone verification flow
- Create storage dashboard
- Create upgrade modals
- Build tier comparison view

See [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) for complete Week 2-3 plan.

---

## 🆘 Need Help?

**Documentation**:
- [README.md](./README.md) - Development status overview
- [MIGRATIONS_COMPLETE_STATUS.md](./MIGRATIONS_COMPLETE_STATUS.md) - What migrations did
- [FILE_ORGANIZATION_CLEANUP.md](./FILE_ORGANIZATION_CLEANUP.md) - Where files are located

**Questions?**
- Check [CURRENT_CODEBASE_TASKS.md](./CURRENT_CODEBASE_TASKS.md) for detailed specs
- Review database types in [../../lib/database.types.ts](../../lib/database.types.ts)
- Look at existing service patterns in `src/services/`

---

**Start Date**: Nov 25, 2025 (Monday)
**End Date**: Nov 29, 2025 (Friday)
**Goal**: Complete foundation code for tier system and SMS sharing
