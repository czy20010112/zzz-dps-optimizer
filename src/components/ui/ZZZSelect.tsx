import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Update coordinates when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Logic handled by the overlay in Portal
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Checking trigger
      }
    };
    window.addEventListener('scroll', () => setIsOpen(false)); // Close on scroll to avoid misalignment
    return () => window.removeEventListener('scroll', () => setIsOpen(false));
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div style={{ marginBottom: '16px' }}>
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
      
      {/* Trigger Button - Matched style with ZZZInput */}
      <div 
        ref={containerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: 'var(--zzz-dark-grey)',
          border: isOpen ? '2px solid var(--zzz-yellow)' : '2px solid var(--zzz-border)', // Match Input border width
          color: 'var(--zzz-white)',
          padding: '10px 12px', // Match Input padding
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? '0 0 10px rgba(250, 219, 20, 0.2)' : 'none',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit'
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

      {/* Portal for Dropdown Menu */}
      {isOpen && createPortal(
        <>
          {/* Invisible Overlay to handle click outside */}
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            background: 'var(--zzz-black)',
            border: '2px solid var(--zzz-yellow)',
            borderTop: 'none',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
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
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
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
        </>,
        document.body
      )}
    </div>
  );
};