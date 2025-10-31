import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { BaseModal, BaseModalProps } from './BaseModal';
import { designTokens } from '../../design/designTokens';

export interface BottomSheetModalProps extends Omit<BaseModalProps, 'children' | 'position' | 'animation'> {
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export function BottomSheetModal({
  title,
  children,
  showCloseButton = true,
  ...baseProps
}: BottomSheetModalProps) {
  return (
    <BaseModal
      {...baseProps}
      position="bottom"
      animation="slideUp"
      size="md"
    >
      {/* Sticky Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: designTokens.colors.surface.primary,
        padding: designTokens.spacing.md,
        borderBottom: `1px solid ${designTokens.colors.borders.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: designTokens.typography.fontSizes.h2,
          fontWeight: designTokens.typography.fontWeights.semibold,
          color: designTokens.colors.neutral.charcoal,
        }}>
          {title}
        </h2>

        {showCloseButton && (
          <button
            onClick={baseProps.onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: designTokens.spacing.xs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designTokens.colors.neutral.darkGray,
            }}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: designTokens.spacing.md }}>
        {children}
      </div>
    </BaseModal>
  );
}
