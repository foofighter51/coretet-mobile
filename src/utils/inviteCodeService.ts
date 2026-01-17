import { supabase } from '../../lib/supabase';

export interface InviteCodeValidation {
  valid: boolean;
  code?: string;
  error?: string;
  metadata?: any;
}

export interface GenerateCodeOptions {
  maxUses?: number;
  expiresInDays?: number;
  metadata?: Record<string, any>;
}

/**
 * Service for managing beta invite codes
 * Handles code generation, validation, and usage tracking
 */
export const inviteCodeService = {
  /**
   * Verify if an invite code is valid and can be used
   * @param code The invite code to verify
   * @returns Validation result with code details or error message
   */
  async verifyCode(code: string): Promise<InviteCodeValidation> {
    const { data, error } = await supabase
      .from('beta_invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid or expired code' };
    }

    if (data.current_uses >= data.max_uses) {
      return { valid: false, error: 'Code has reached maximum uses' };
    }

    return {
      valid: true,
      code: data.code,
      metadata: data.metadata
    };
  },

  /**
   * Mark a code as used by a specific user
   * Records usage and increments the usage counter
   * @param code The invite code that was used
   * @param userId The ID of the user who used the code
   */
  async useCode(code: string, userId: string) {
    // Get code data
    const { data: codeData, error: fetchError } = await supabase
      .from('beta_invite_codes')
      .select('id, current_uses')
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError || !codeData) {
      return { error: 'Code not found' };
    }

    // Record usage
    const { error: insertError } = await supabase
      .from('beta_code_usage')
      .insert({
        code_id: codeData.id,
        user_id: userId
      });

    if (insertError) {
      return { error: insertError.message };
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from('beta_invite_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  },

  /**
   * Generate a new invite code (admin only)
   * @param options Configuration options for the code
   * @returns Generated code data or error
   */
  async generateCode(options: GenerateCodeOptions = {}) {
    const code = generateRandomCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 90));

    const { data, error } = await supabase
      .from('beta_invite_codes')
      .insert({
        code,
        max_uses: options.maxUses || 1,
        expires_at: expiresAt.toISOString(),
        metadata: options.metadata || {},
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Get all invite codes (admin only)
   * @returns List of all invite codes with usage stats
   */
  async getAllCodes() {
    const { data, error } = await supabase
      .from('beta_invite_codes')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Deactivate an invite code (admin only)
   * @param codeId The ID of the code to deactivate
   */
  async deactivateCode(codeId: string) {
    const { error } = await supabase
      .from('beta_invite_codes')
      .update({ is_active: false })
      .eq('id', codeId);

    return { error };
  },

  /**
   * Get usage statistics for a specific code
   * @param codeId The ID of the code
   */
  async getCodeUsage(codeId: string) {
    const { data, error } = await supabase
      .from('beta_code_usage')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email
        )
      `)
      .eq('code_id', codeId)
      .order('used_at', { ascending: false });

    return { data, error };
  },
};

/**
 * Generate a random invite code
 * Uses uppercase letters and numbers, excluding confusing characters (I, O, 0, 1)
 * @returns An 8-character random code
 */
function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
