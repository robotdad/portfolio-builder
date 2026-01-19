'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useImageUpload } from '@/hooks/useImageUpload'

interface AboutSettingsProps {
  portfolioId: string
  bio: string
  profilePhotoUrl: string | null
  profilePhotoId: string | null
  onBioChange: (bio: string) => void
  onProfilePhotoChange: (photoId: string | null, photoUrl: string | null) => void
  onFieldBlur: () => void
  isSaving?: boolean
}

/**
 * AboutSettings - Settings panel for About section configuration
 * 
 * Provides controls for:
 * - Toggle to show/hide About section
 * - Bio text editor (max 500 chars)
 * - Profile photo upload/change/remove
 */
export function AboutSettings({
  portfolioId,
  bio,
  profilePhotoUrl,
  onBioChange,
  onProfilePhotoChange,
  onFieldBlur,
}: AboutSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [optimisticPhotoUrl, setOptimisticPhotoUrl] = useState<string | null>(null)
  
  // Use the existing image upload hook
  const { uploadFile, isUploading, progress } = useImageUpload({
    portfolioId,
    context: 'profile',
    onOptimisticUpdate: (previewUrl) => {
      setOptimisticPhotoUrl(previewUrl)
    },
    onSuccess: (asset) => {
      setOptimisticPhotoUrl(null)
      onProfilePhotoChange(asset.id, asset.url)
    },
    onError: () => {
      setOptimisticPhotoUrl(null)
    },
    onUndo: () => {
      setOptimisticPhotoUrl(null)
    },
  })

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadFile])

  const handlePhotoRemove = useCallback(() => {
    onProfilePhotoChange(null, null)
  }, [onProfilePhotoChange])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleBioChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 500) {
      onBioChange(value)
    }
  }, [onBioChange])

  const displayPhotoUrl = optimisticPhotoUrl || profilePhotoUrl

  return (
    <div className="about-settings">
      {/* Bio field */}
      <div className="about-settings__field">
        <label htmlFor="about-bio" className="about-settings__label">
          Bio
        </label>
        <textarea
          id="about-bio"
          value={bio}
          onChange={handleBioChange}
          onBlur={onFieldBlur}
          placeholder="Tell visitors about your work and experience..."
          className="about-settings__textarea"
          rows={4}
          maxLength={500}
        />
        <div className="about-settings__char-count">
          {bio.length} / 500 characters
        </div>
      </div>

      {/* Profile photo field */}
      <div className="about-settings__field">
        <label className="about-settings__label">
          Profile Photo
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handlePhotoUpload}
          className="about-settings__file-input"
          aria-label="Upload profile photo"
        />

        {displayPhotoUrl ? (
          <div className="about-settings__photo-preview">
            <div className="about-settings__photo-wrapper">
              <Image
                src={displayPhotoUrl}
                alt="Profile preview"
                className="about-settings__photo-image"
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
              />
              {isUploading && (
                <div className="about-settings__upload-overlay">
                  <div 
                    className="about-settings__upload-progress"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="about-settings__photo-actions">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="about-settings__btn about-settings__btn--secondary"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handlePhotoRemove}
                disabled={isUploading}
                className="about-settings__btn about-settings__btn--ghost"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="about-settings__upload-area"
          >
            {isUploading ? (
              <>
                <span className="about-settings__upload-spinner" />
                <span>Uploading... {progress}%</span>
              </>
            ) : (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="about-settings__upload-icon"
                >
                  <path
                    d="M12 16V8M12 8L9 11M12 8L15 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Upload Profile Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <style jsx>{`
        .about-settings {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .about-settings__header {
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .about-settings__title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text, #111827);
          margin: 0;
        }

        .about-settings__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .about-settings__field--toggle {
          gap: 4px;
        }

        .about-settings__label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-muted, #6b7280);
        }

        .about-settings__toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .about-settings__checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--color-accent, #3b82f6);
          cursor: pointer;
        }

        .about-settings__toggle-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #111827);
        }

        .about-settings__helper {
          font-size: 12px;
          color: var(--color-text-muted, #6b7280);
          margin: 0;
          padding-left: 24px;
        }

        .about-settings__textarea {
          width: 100%;
          min-height: 100px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          color: var(--color-text, #1f2937);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          resize: vertical;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .about-settings__textarea:hover {
          border-color: var(--color-border-strong, #cbd5e1);
        }

        .about-settings__textarea:focus {
          outline: none;
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.15);
        }

        .about-settings__textarea::placeholder {
          color: var(--color-text-placeholder, #9ca3af);
        }

        .about-settings__char-count {
          font-size: 12px;
          color: var(--color-text-muted, #6b7280);
          text-align: right;
        }

        .about-settings__file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        .about-settings__photo-preview {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .about-settings__photo-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .about-settings__photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .about-settings__upload-overlay {
          position: absolute;
          inset: 0;
          background: hsla(0, 0%, 0%, 0.5);
          display: flex;
          align-items: flex-end;
        }

        .about-settings__upload-progress {
          height: 4px;
          background: var(--color-accent, #3b82f6);
          transition: width 150ms ease;
        }

        .about-settings__photo-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .about-settings__btn {
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease;
        }

        .about-settings__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .about-settings__btn--secondary {
          background: var(--color-surface, #ffffff);
          color: var(--color-text, #111827);
          border: 1px solid var(--color-border, #d1d5db);
        }

        .about-settings__btn--secondary:hover:not(:disabled) {
          background: var(--color-surface-hover, #f3f4f6);
          border-color: var(--color-border-strong, #9ca3af);
        }

        .about-settings__btn--ghost {
          background: transparent;
          color: var(--color-text-muted, #6b7280);
          border: none;
        }

        .about-settings__btn--ghost:hover:not(:disabled) {
          background: var(--color-surface-hover, #f3f4f6);
          color: var(--color-text, #111827);
        }

        .about-settings__upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          border: 2px dashed var(--color-border, #d1d5db);
          border-radius: 8px;
          background: var(--color-surface, #ffffff);
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
          width: 100%;
          font-size: 13px;
          color: var(--color-text-muted, #6b7280);
        }

        .about-settings__upload-area:hover:not(:disabled) {
          border-color: var(--color-accent, #3b82f6);
          background: var(--color-accent-light, #eff6ff);
        }

        .about-settings__upload-area:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .about-settings__upload-icon {
          color: var(--color-text-muted, #6b7280);
        }

        .about-settings__upload-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-accent, #3b82f6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export type { AboutSettingsProps }
