/**
 * Mobile bottom sheet wrapper for portfolio settings.
 * Provides touch-friendly settings access on mobile devices.
 */
'use client'

import { BottomSheet } from '@/components/shared/BottomSheet'
import { SettingsForm } from './SettingsForm'
import type { SettingsFormProps } from './types'

export interface MobileSheetProps extends SettingsFormProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSheet({
  isOpen,
  onClose,
  ...formProps
}: MobileSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Portfolio Settings"
    >
      <div className="mobile-settings-form">
        <SettingsForm {...formProps} />
        
        <style jsx>{`
          .mobile-settings-form {
            padding: 8px 8px 0;
            max-height: 70vh;
            overflow-y: auto;
          }
        `}</style>
      </div>
    </BottomSheet>
  )
}
