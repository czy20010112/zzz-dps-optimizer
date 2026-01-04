import React from 'react';
import { useLanguage } from '../../locales';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { lang, toggleLang } = useLanguage();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        marginBottom: '24px',
        borderBottom: '2px solid var(--zzz-yellow)',
        background: 'linear-gradient(90deg, var(--zzz-black) 0%, var(--zzz-dark-grey) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            background: 'var(--zzz-yellow)',
            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)'
          }} />
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontStyle: 'italic', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--zzz-white)',
            textShadow: '0 0 10px rgba(250, 219, 20, 0.5)'
          }}>
            ZZZ <span style={{ color: 'var(--zzz-yellow)' }}>Optimizer</span> // TYPE-II
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={toggleLang}
            style={{
              background: 'transparent',
              border: '1px solid var(--zzz-border)',
              color: 'var(--zzz-yellow)',
              padding: '4px 12px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            [{lang.toUpperCase()}]
          </button>
          
          <div style={{ 
            fontFamily: 'monospace', 
            color: 'var(--zzz-border)',
            fontSize: '0.8rem' 
          }}>
            SYS.VER.0.9.2_BETA
          </div>
        </div>
      </header>

      {/* Content Content */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};