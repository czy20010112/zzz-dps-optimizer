import React from 'react';

interface ZZZCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  borderColor?: string;
  style?: React.CSSProperties;
}

/**
 * ZZZCard
 * A "container" style component with Chamfered corners (clipped corners)
 * and thick industrial borders.
 * Supports 'extra' for corner actions, similar to Ant Design Card.
 */
export const ZZZCard: React.FC<ZZZCardProps> = ({ 
  children, 
  title, 
  extra,
  className = '', 
  borderColor = 'var(--zzz-grey)',
  style = {}
}) => {
  return (
    <div
      className={`zzz-card ${className}`}
      style={{
        position: 'relative',
        background: 'var(--zzz-dark-grey)',
        border: `2px solid ${borderColor}`,
        padding: '24px',
        // Clip corners: Top-Left, Top-Right, Bottom-Right, Bottom-Left
        clipPath: `polygon( 
          var(--zzz-corner-clip) 0, 
          100% 0, 
          100% calc(100% - var(--zzz-corner-clip)), 
          calc(100% - var(--zzz-corner-clip)) 100%, 
          0 100%, 
          0 var(--zzz-corner-clip)
        )`,
        ...style
      }}
    >
      {/* Decorative corner accents */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '20px',
        height: '20px',
        borderTop: '4px solid var(--zzz-yellow)',
        borderLeft: '4px solid var(--zzz-yellow)',
        zIndex: 10,
        pointerEvents: 'none'
      }} />

      {(title || extra) && (
        <div style={{
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '2px dashed var(--zzz-light-grey)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h3 style={{
                    margin: 0,
                    color: 'var(--zzz-white)',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    textShadow: '2px 2px 0px var(--zzz-black)'
                }}>
                    {title}
                </h3>
                {/* Deco block */}
                <div style={{ width: '12px', height: '12px', background: 'var(--zzz-yellow)', marginLeft: '12px' }} />
            </div>
          )}
          
          {extra && (
            <div style={{ marginLeft: 'auto' }}>
                {extra}
            </div>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};