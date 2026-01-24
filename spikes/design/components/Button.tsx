import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'small';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'default',
  disabled = false,
  onClick,
  children 
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: size === 'small' ? 'var(--font-size-small)' : 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-semibold)',
    minHeight: size === 'small' ? '36px' : 'var(--touch-min)',
    padding: size === 'small' ? 'var(--space-2) var(--space-4)' : 'var(--space-3) var(--space-5)',
    borderRadius: '6px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--duration-quick) var(--ease-smooth)',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-accent)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-accent)',
      border: '2px solid var(--color-accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-primary)',
      border: 'none',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const hoverStyles: React.CSSProperties = !disabled && isHovered ? {
    ...(variant === 'primary' && {
      background: 'var(--color-accent-hover)',
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px hsla(var(--color-accent-hsl), 0.3)`,
    }),
    ...(variant === 'secondary' && {
      background: 'var(--color-accent)',
      color: 'white',
      borderColor: 'var(--color-accent)',
    }),
    ...(variant === 'ghost' && {
      background: 'var(--color-surface)',
    }),
  } : {};

  const activeStyles: React.CSSProperties = !disabled && isPressed ? {
    transform: 'translateY(0)',
    ...(variant === 'primary' && {
      boxShadow: `0 2px 4px hsla(var(--color-accent-hsl), 0.2)`,
    }),
  } : {};

  return (
    <button
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...hoverStyles,
        ...activeStyles,
      }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {children}
    </button>
  );
}
