import React, { useState } from 'react';
import { ZZZCard } from '../ui/ZZZCard';
import { OptimizationResult, EnemyStats } from '../../types';
import { useLanguage } from '../../locales';
import { FormulaModal } from '../modals/FormulaModal';

interface ResultDashboardProps {
  theoretical: OptimizationResult | null;
  inventoryResult: OptimizationResult | null;
  isCalculating: boolean;
  enemy: EnemyStats; // Changed from optional to required to ensure modal works
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ theoretical, inventoryResult, isCalculating, enemy }) => {
  const { t } = useLanguage();
  const [showFormula, setShowFormula] = useState(false);

  // Determine which result to show details for
  const activeResult = inventoryResult || theoretical;

  const handleOpenFormula = () => {
    if (activeResult && enemy) {
      console.log('Opening Formula Modal', { activeResult, enemy });
      setShowFormula(true);
    } else {
        console.warn('Cannot open modal: missing result or enemy data');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Status Monitor */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px', border: '1px solid var(--zzz-border)', background: 'var(--zzz-black)'
      }}>
        <span style={{ color: 'var(--zzz-light-grey)', fontSize: '0.8rem' }}>SYSTEM_STATUS</span>
        <span style={{ 
          color: isCalculating ? 'var(--zzz-yellow)' : 'var(--zzz-cyan)', 
          fontWeight: 'bold', animation: isCalculating ? 'glitch-anim-1 1s infinite' : 'none'
        }}>
          {isCalculating ? 'PROCESSING...' : 'READY'}
        </span>
      </div>

      {/* Main DPS Display (Theoretical) */}
      <div className={theoretical ? 'animate-entry' : ''}>
        {theoretical && (
          <ZZZCard title={t('max_dps')} borderColor="var(--zzz-yellow)">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div 
                onClick={handleOpenFormula}
                style={{ 
                  fontSize: '3.5rem', fontWeight: 900, color: 'var(--zzz-yellow)',
                  textShadow: '4px 4px 0px rgba(0,0,0,1)', fontFamily: 'monospace',
                  cursor: 'pointer', transition: 'transform 0.1s',
                  userSelect: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Click for Formula Details"
              >
                {Math.round(theoretical.dps).toLocaleString()}
              </div>
              
              <div style={{ height: '2px', background: 'var(--zzz-yellow)', margin: '24px auto', width: '50%' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
                <div>
                    <div style={{color:'#CCC', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px'}}>{t('effective_stats')}</div>
                    <div style={{fontWeight: 'bold', color: 'var(--zzz-white)', marginBottom: '4px'}}>
                      ATK: <span style={{color: 'var(--zzz-cyan)'}}>{Math.round(theoretical.stats.atkBase * (1 + theoretical.stats.atkPercent/100) + theoretical.stats.atkFlat)}</span>
                    </div>
                    <div style={{fontWeight: 'bold', color: 'var(--zzz-white)'}}>
                      CRIT: <span style={{color: 'var(--zzz-red)'}}>{theoretical.stats.critRate.toFixed(1)}%</span> / <span style={{color: 'var(--zzz-red)'}}>{theoretical.stats.critDmg.toFixed(1)}%</span>
                    </div>
                </div>
                <div>
                    <div style={{color:'#CCC', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px'}}>{t('config')}</div>
                    <div style={{color: '#EEE', fontSize: '0.9rem'}}>{theoretical.description}</div>
                </div>
              </div>
            </div>
          </ZZZCard>
        )}
      </div>

      {/* Inventory Result & Top 5 */}
      <div className={inventoryResult ? 'animate-entry' : ''}>
        {inventoryResult && (
          <ZZZCard title={t('mode_inventory')}>
            <div style={{ fontSize: '2rem', color: 'var(--zzz-white)', marginBottom: '16px' }}>
              {t('damage')}: 
              <span 
                onClick={handleOpenFormula}
                style={{ color: 'var(--zzz-yellow)', cursor: 'pointer', marginLeft: '12px' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {Math.round(inventoryResult.dps).toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#CCC', marginBottom: '24px' }}>
              {inventoryResult.description}
            </div>

            {/* Top 5 Bar Chart */}
            {inventoryResult.topBuilds && inventoryResult.topBuilds.length > 0 && (
              <div style={{ borderTop: '1px dashed var(--zzz-grey)', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--zzz-white)' }}>TOP 5 {t('build')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inventoryResult.topBuilds.map((build, i) => {
                    const widthPercent = (build.dps / inventoryResult.dps) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                        <div style={{ width: '20px', color: 'var(--zzz-light-grey)' }}>#{build.rank}</div>
                        <div style={{ flex: 1, marginRight: '12px' }}>
                          <div style={{ 
                            height: '24px', 
                            width: `${widthPercent}%`, 
                            background: i === 0 ? 'var(--zzz-yellow)' : 'var(--zzz-light-grey)',
                            display: 'flex', alignItems: 'center', paddingLeft: '8px',
                            color: 'var(--zzz-black)', fontWeight: 'bold'
                          }}>
                            {Math.round(build.dps).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ color: 'var(--zzz-white)', width: '150px', textAlign: 'right', fontSize: '0.75rem' }}>
                          {build.comboName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ZZZCard>
        )}
      </div>

      {/* Logic for Formula Modal */}
      {showFormula && activeResult && enemy && (
        <FormulaModal 
          visible={showFormula} 
          onClose={() => setShowFormula(false)}
          result={activeResult}
          enemy={enemy}
        />
      )}

    </div>
  );
};