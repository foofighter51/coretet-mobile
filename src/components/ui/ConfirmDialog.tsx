import React from 'react';
import { BaseModal, BaseModalProps } from './BaseModal';
import { designTokens } from '../../design/designTokens';

export interface ConfirmDialogProps extends Omit<BaseModalProps, 'children'> {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  ...baseProps
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    baseProps.onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    baseProps.onClose();
  };

  return (
    <BaseModal {...baseProps} position="center" animation="fade" size="sm">
      <div style={{ padding: designTokens.spacing.lg }}>
        {/* Title */}
        <h2
          style={{
            margin: 0,
            marginBottom: designTokens.spacing.md,
            fontSize: designTokens.typography.fontSizes.h2,
            fontWeight: designTokens.typography.fontWeights.semibold,
            color: designTokens.colors.neutral.charcoal,
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            margin: 0,
            marginBottom: designTokens.spacing.lg,
            fontSize: designTokens.typography.fontSizes.body,
            color: designTokens.colors.neutral.darkGray,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: designTokens.spacing.sm,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
              border: `1px solid ${designTokens.colors.borders.default}`,
              borderRadius: designTokens.borderRadius.md,
              backgroundColor: designTokens.colors.surface.primary,
              color: designTokens.colors.neutral.charcoal,
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>

          <button
            onClick={handleConfirm}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
              border: 'none',
              borderRadius: designTokens.borderRadius.md,
              backgroundColor: destructive
                ? designTokens.colors.status.error
                : designTokens.colors.interactive.primary,
              color: designTokens.colors.text.inverse,
              fontSize: designTokens.typography.fontSizes.body,
              fontWeight: designTokens.typography.fontWeights.medium,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
