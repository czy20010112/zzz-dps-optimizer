import React, { useState } from 'react';

interface ZZZButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  block?: boolean;
}

/**
 * ZZZButton
 * High impact, sharp corners, glitch effect on hover.
 */
export const ZZZButton: React.FC<ZZZButtonProps> = ({ 
  children, 
  variant = 'primary', 
  block = false,
  className = '',
  style = {},
  disabled,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Color mapping
  const colors = {
    primary: { bg: 'var(--zzz-yellow)', text: 'var(--zzz-black)', border: 'var(--zzz-yellow)' },
    secondary: { bg: 'transparent', text: 'var(--zzz-yellow)', border: 'var(--zzz-yellow)' },
    danger: { bg: 'var(--zzz-red)', text: 'var(--zzz-white)', border: 'var(--zzz-red)' },
  };

  const current = colors[variant];

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: block ? 'block' : 'inline-block',
    width: block ? '100%' : 'auto',
    padding: '12px 24px',
    background: current.bg,
    color: current.text,
    border: `2px solid ${current.border}`,
    fontFamily: 'inherit',
    fontWeight: 900,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.1s linear',
    outline: 'none',
    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
    ...style
  };

  return (
    <button
      className={`zzz-btn ${className}`}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      {...props}
    >
      {/* Glitch layers (visible on hover) */}
      {isHovered && !disabled && (
        <>
          <span className="glitch-layer" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: current.bg, color: current.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'inset(0 0 0 0)',
            animation: 'glitch-anim-1 0.4s infinite linear alternate-reverse'
          }}>
            {children}
          </span>
          <span className="glitch-layer" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: current.bg, color: current.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'inset(0 0 0 0)',
            animation: 'glitch-anim-2 0.4s infinite linear alternate-reverse',
            opacity: 0.7
          }}>
            {children}
          </span>
        </>
      )}
      
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </button>
  );
};