import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Plus, X, Tag } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

export interface VersionType {
  id: string;
  name: string;
  is_default: boolean;
  band_id?: string | null;
}

export interface VersionTypeSelectorProps {
  /** Current selected version type */
  value: string | null;
  /** Available version types */
  types: VersionType[];
  /** Called when user selects a type */
  onChange: (type: string | null) => void;
  /** Called when user creates a custom type */
  onCreateType?: (name: string) => Promise<void>;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Placeholder text when no type is selected */
  placeholder?: string;
}

/**
 * VersionTypeSelector - Dropdown for selecting track version types
 *
 * Features:
 * - Pre-populated list of common types
 * - Custom type creation
 * - Compact inline mode for track rows
 */
export const VersionTypeSelector: React.FC<VersionTypeSelectorProps> = ({
  value,
  types,
  onChange,
  onCreateType,
  disabled = false,
  compact = false,
  placeholder = 'Add type',
}) => {
  const designTokens = useDesignTokens();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewTypeName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleSelect = useCallback((typeName: string | null) => {
    onChange(typeName);
    setIsOpen(false);
  }, [onChange]);

  const handleCreateType = useCallback(async () => {
    if (!newTypeName.trim() || !onCreateType) return;

    setIsSubmitting(true);
    try {
      await onCreateType(newTypeName.trim());
      // Also select the newly created type
      onChange(newTypeName.trim());
      setNewTypeName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create type:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newTypeName, onCreateType, onChange]);

  const selectedType = types.find(t => t.name === value);

  // Styles
  const buttonStyle: React.CSSProperties = compact
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: `2px ${designTokens.spacing.xs}`,
        backgroundColor: value ? `${designTokens.colors.primary.blue}15` : 'transparent',
        border: `1px solid ${value ? designTokens.colors.primary.blue : designTokens.colors.borders.subtle}`,
        borderRadius: designTokens.borderRadius.sm,
        color: value ? designTokens.colors.primary.blue : designTokens.colors.text.muted,
        fontSize: designTokens.typography.fontSizes.caption,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: designTokens.spacing.sm,
        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
        backgroundColor: designTokens.colors.surface.secondary,
        border: `1px solid ${designTokens.colors.borders.default}`,
        borderRadius: designTokens.borderRadius.sm,
        color: value ? designTokens.colors.text.primary : designTokens.colors.text.muted,
        fontSize: designTokens.typography.fontSizes.bodySmall,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: '100%',
      };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: compact ? 'inline-block' : 'block' }}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={buttonStyle}
      >
        {compact ? (
          <>
            <Tag size={10} />
            {value || placeholder}
          </>
        ) : (
          <>
            <span>{value || placeholder}</span>
            <ChevronDown size={14} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            minWidth: compact ? '160px' : '100%',
            backgroundColor: designTokens.colors.surface.primary,
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: designTokens.borderRadius.md,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Clear option if value is set */}
          {value && (
            <button
              onClick={() => handleSelect(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
                color: designTokens.colors.text.muted,
                fontSize: designTokens.typography.fontSizes.bodySmall,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <X size={14} />
              Clear type
            </button>
          )}

          {/* Type options */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.name)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                  backgroundColor: type.name === value
                    ? designTokens.colors.surface.active
                    : 'transparent',
                  border: 'none',
                  color: designTokens.colors.text.primary,
                  fontSize: designTokens.typography.fontSizes.bodySmall,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{type.name}</span>
                {!type.is_default && (
                  <span
                    style={{
                      fontSize: designTokens.typography.fontSizes.caption,
                      color: designTokens.colors.text.muted,
                    }}
                  >
                    custom
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Create new type */}
          {onCreateType && (
            <div
              style={{
                borderTop: `1px solid ${designTokens.colors.borders.subtle}`,
                padding: designTokens.spacing.sm,
              }}
            >
              {isCreating ? (
                <div style={{ display: 'flex', gap: designTokens.spacing.xs }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateType();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewTypeName('');
                      }
                    }}
                    placeholder="Type name..."
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: designTokens.spacing.xs,
                      backgroundColor: designTokens.colors.surface.secondary,
                      border: `1px solid ${designTokens.colors.borders.default}`,
                      borderRadius: designTokens.borderRadius.sm,
                      color: designTokens.colors.text.primary,
                      fontSize: designTokens.typography.fontSizes.bodySmall,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleCreateType}
                    disabled={!newTypeName.trim() || isSubmitting}
                    style={{
                      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                      backgroundColor: newTypeName.trim()
                        ? designTokens.colors.primary.blue
                        : designTokens.colors.surface.tertiary,
                      border: 'none',
                      borderRadius: designTokens.borderRadius.sm,
                      color: newTypeName.trim()
                        ? designTokens.colors.neutral.white
                        : designTokens.colors.text.muted,
                      fontSize: designTokens.typography.fontSizes.caption,
                      cursor: newTypeName.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.xs,
                    padding: designTokens.spacing.xs,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: designTokens.colors.primary.blue,
                    fontSize: designTokens.typography.fontSizes.bodySmall,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  Create custom type
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VersionTypeSelector;
