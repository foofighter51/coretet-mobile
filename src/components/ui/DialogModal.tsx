import React, { ReactNode, RefObject } from 'react';
import { X } from 'lucide-react';
import { BaseModal, BaseModalProps } from './BaseModal';
import { designTokens } from '../../design/designTokens';

export interface DialogModalProps extends Omit<BaseModalProps, 'children' | 'position'> {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
}

export function DialogModal({
  title,
  footer,
  children,
  showCloseButton = true,
  ...baseProps
}: DialogModalProps) {
  return (
    <BaseModal {...baseProps} position="center" animation="fade">
      <div style={{ padding: designTokens.spacing.lg }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designTokens.spacing.md,
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
        <div>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{
            marginTop: designTokens.spacing.lg,
            paddingTop: designTokens.spacing.md,
            borderTop: `1px solid ${designTokens.colors.borders.default}`,
          }}>
            {footer}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
