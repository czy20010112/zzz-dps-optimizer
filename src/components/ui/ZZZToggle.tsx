import React from 'react';

interface ZZZToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ZZZToggle: React.FC<ZZZToggleProps> = ({ label, checked, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* The Switch Track */}
      <div style={{
        width: '40px',
        height: '20px',
        background: checked ? 'var(--zzz-yellow)' : 'var(--zzz-grey)',
        position: 'relative',
        clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        transition: 'background 0.2s'
      }}>
        {/* The Switch Knob */}
        <div style={{
          width: '12px',
          height: '12px',
          background: checked ? 'var(--zzz-black)' : 'var(--zzz-light-grey)',
          position: 'absolute',
          top: '4px',
          left: checked ? '24px' : '4px',
          transition: 'left 0.2s ease-out'
        }} />
      </div>

      <span style={{
        color: checked ? 'var(--zzz-yellow)' : 'var(--zzz-white)',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        fontSize: '0.9rem'
      }}>
        {label}
      </span>
    </div>
  );
};