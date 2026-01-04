import React from 'react';

interface ZZZInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const ZZZInput: React.FC<ZZZInputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          color: 'var(--zzz-white)',
          fontWeight: 800,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          marginBottom: '8px',
          fontSize: '0.9rem'
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          background: 'var(--zzz-dark-grey)',
          border: error ? '2px solid var(--zzz-red)' : '2px solid var(--zzz-border)',
          padding: '10px 12px',
          color: 'var(--zzz-white)',
          fontFamily: 'inherit',
          fontWeight: 'bold',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--zzz-yellow)';
          e.currentTarget.style.boxShadow = '0 0 10px rgba(250, 219, 20, 0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--zzz-red)' : 'var(--zzz-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <div style={{ color: 'var(--zzz-red)', marginTop: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
};