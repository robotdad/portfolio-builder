'use client'

import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

// ============================================================================
// Types
// ============================================================================

interface FormFieldBaseProps {
  /** Field label text */
  label: string
  /** Error message to display (if any) */
  error?: string
  /** Whether the field has been touched/blurred */
  touched?: boolean
  /** Optional hint text below the label */
  hint?: string
  /** Whether the field is required */
  required?: boolean
  /** Additional className for the wrapper */
  className?: string
}

interface TextFieldProps extends FormFieldBaseProps {
  type: 'text' | 'email' | 'password' | 'url' | 'tel'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  maxLength?: number
  showCharCount?: boolean
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'onBlur'>
}

interface TextAreaFieldProps extends FormFieldBaseProps {
  type: 'textarea'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  maxLength?: number
  showCharCount?: boolean
  rows?: number
  textareaProps?: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'onBlur'>
}

interface CustomFieldProps extends FormFieldBaseProps {
  type: 'custom'
  children: ReactNode
}

export type FormFieldProps = TextFieldProps | TextAreaFieldProps | CustomFieldProps

// ============================================================================
// Component
// ============================================================================

export function FormField(props: FormFieldProps) {
  const generatedId = useId()
  const fieldId = `field-${generatedId}`
  const errorId = `error-${generatedId}`
  
  const {
    label,
    error,
    touched = false,
    hint,
    required = false,
    className = '',
  } = props

  const showError = touched && error

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={fieldId} className="form-field__label">
        {label}
        {required && <span className="form-field__required" aria-hidden="true"> *</span>}
      </label>
      
      {hint && (
        <p className="form-field__hint">{hint}</p>
      )}
      
      <div className="form-field__input-wrapper">
        {props.type === 'custom' ? (
          props.children
        ) : props.type === 'textarea' ? (
          <textarea
            id={fieldId}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            onBlur={props.onBlur}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            rows={props.rows ?? 4}
            className={`form-field__textarea ${showError ? 'form-field__textarea--error' : ''}`}
            aria-invalid={showError ? 'true' : undefined}
            aria-describedby={showError ? errorId : undefined}
            {...props.textareaProps}
          />
        ) : (
          <input
            id={fieldId}
            type={props.type}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            onBlur={props.onBlur}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            className={`form-field__input ${showError ? 'form-field__input--error' : ''}`}
            aria-invalid={showError ? 'true' : undefined}
            aria-describedby={showError ? errorId : undefined}
            {...props.inputProps}
          />
        )}
        
        {props.type !== 'custom' && props.showCharCount && props.maxLength && (
          <span className="form-field__char-count" aria-live="polite">
            {props.value.length}/{props.maxLength}
          </span>
        )}
      </div>
      
      {showError && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================================================
// Styles (CSS Module alternative - add to globals.css or component CSS)
// ============================================================================
// 
// The following styles should be added to globals.css or a dedicated CSS file:
//
// .form-field { margin-bottom: var(--space-4); }
// .form-field__label { display: block; font-weight: var(--font-medium); margin-bottom: var(--space-1); }
// .form-field__required { color: var(--color-error); }
// .form-field__hint { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-1); }
// .form-field__input-wrapper { position: relative; }
// .form-field__input, .form-field__textarea { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
// .form-field__input--error, .form-field__textarea--error { border-color: var(--color-error); }
// .form-field__char-count { position: absolute; right: var(--space-2); bottom: var(--space-2); font-size: var(--text-xs); color: var(--color-text-muted); }
// .form-field__error { color: var(--color-error); font-size: var(--text-sm); margin-top: var(--space-1); }

export default FormField
