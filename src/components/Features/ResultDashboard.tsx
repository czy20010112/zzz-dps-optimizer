import React, { useState } from 'react';
import { ZZZCard } from '../ui/ZZZCard';
import { OptimizationResult, EnemyStats, BuildResult } from '../../types';
import { useLanguage } from '../../locales';
import { FormulaModal } from '../modals/FormulaModal';
import { BuildDetailsModal } from '../modals/BuildDetailsModal';
import { DISC_SETS } from '../../data';

interface ResultDashboardProps {
  theoretical: OptimizationResult | null;
  inventoryResult: OptimizationResult | null;
  isCalculating: boolean;
  enemy: EnemyStats; 
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ theoretical, inventoryResult, isCalculating, enemy }) => {
  const { t, lang } = useLanguage();
  const [showFormula, setShowFormula] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<BuildResult | null>(null);

  // Determine which result to show details for
  const activeResult = inventoryResult || theoretical;

  const handleOpenFormula = () => {
    if (activeResult && enemy) {
      setShowFormula(true);
    }
  };

  const handleBuildClick = (build: BuildResult) => {
    if (build.stats && build.combo) {
        setSelectedBuild(build);
    }
  };

  // Task 2: Render Set Names strictly in Current Language, vertically stacked if mixed.
  const renderSetCombo = (comboName: string) => {
      // Check if it matches ID:Count format from worker
      if (comboName.includes(':')) {
           const parts = comboName.split(' + ');
           return (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
               {parts.map((part, idx) => {
                   const [id, count] = part.split(':');
                   let displayName = id;
                   
                   const stdSet = DISC_SETS.find(s => s.id === id);
                   if (stdSet) {
                     displayName = stdSet.name[lang];
                   } else if (id === 'Rainbow') {
                     displayName = t('rainbow_set');
                   }

                   // If it's Rainbow:0, don't show (0)
                   const suffix = (id === 'Rainbow' && count === '0') ? '' : ` (${count})`;
                   
                   return (
                     <div key={idx}>
                       {displayName}{suffix}
                     </div>
                   );
               })}
             </div>
           );
      }
      // Fallback for raw text
      return comboName; 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Status Monitor */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px', border: '1px solid var(--zzz-border)', background: 'var(--zzz-black)'
      }}>
        <span style={{ color: 'var(--zzz-light-grey)', fontSize: '0.8rem' }}>{t('system_status')}</span>
        <span style={{ 
          color: isCalculating ? 'var(--zzz-yellow)' : 'var(--zzz-cyan)', 
          fontWeight: 'bold', animation: isCalculating ? 'glitch-anim-1 1s infinite' : 'none'
        }}>
          {isCalculating ? t('processing') : t('ready')}
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
                      <div 
                        key={i} 
                        onClick={() => handleBuildClick(build)} 
                        style={{ 
                            display: 'flex', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer',
                            padding: '6px', borderRadius: '4px',
                            transition: 'background 0.2s',
                            justifyContent: 'space-between'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Rank & Bar Section */}
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '16px' }}>
                            <div style={{ width: '20px', color: 'var(--zzz-light-grey)' }}>#{build.rank}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    height: '24px', 
                                    width: `${widthPercent}%`, 
                                    minWidth: '100px', // Ensure text fits
                                    background: i === 0 ? 'var(--zzz-yellow)' : 'var(--zzz-light-grey)',
                                    display: 'flex', alignItems: 'center', paddingLeft: '8px',
                                    color: 'var(--zzz-black)', fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {Math.round(build.dps).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Set Name Section (Aligned Right, Stacked if mixed) */}
                        <div style={{ color: 'var(--zzz-white)', textAlign: 'right', fontSize: '0.75rem' }}>
                          {renderSetCombo(build.comboName)}
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

      {/* Task 4: Detailed Build Modal */}
      {selectedBuild && enemy && (
          <BuildDetailsModal 
            visible={!!selectedBuild}
            onClose={() => setSelectedBuild(null)}
            build={selectedBuild}
            enemy={enemy}
            skillMultiplier={activeResult?.skillMultiplier || 25}
          />
      )}

    </div>
  );
};