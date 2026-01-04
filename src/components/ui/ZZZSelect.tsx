import React, { useState, useRef, useEffect } from 'react';

interface Option {
  label: string;
  value: string;
}

interface ZZZSelectProps {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export const ZZZSelect: React.FC<ZZZSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div ref={containerRef} style={{ marginBottom: '16px', position: 'relative' }}>
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
      
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--zzz-dark-grey)',
          border: isOpen ? '1px solid var(--zzz-yellow)' : '1px solid var(--zzz-border)',
          color: 'var(--zzz-white)',
          padding: '10px 12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? '0 0 10px rgba(250, 219, 20, 0.2)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{selectedLabel}</span>
        <span style={{ 
          fontSize: '0.8rem', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          color: 'var(--zzz-yellow)'
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: 'var(--zzz-black)',
          border: '1px solid var(--zzz-yellow)',
          borderTop: 'none',
          zIndex: 100,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="zzz-option"
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--zzz-grey)',
                color: opt.value === value ? 'var(--zzz-yellow)' : 'var(--zzz-white)',
                background: opt.value === value ? 'var(--zzz-dark-grey)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--zzz-dark-grey)';
                e.currentTarget.style.paddingLeft = '18px'; // Animation effect
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = opt.value === value ? 'var(--zzz-dark-grey)' : 'transparent';
                e.currentTarget.style.paddingLeft = '12px';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};