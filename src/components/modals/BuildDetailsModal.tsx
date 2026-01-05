import React from 'react';
import { BaseStats, EnemyStats, BuildResult, StatType } from '../../types';
import { ZZZButton } from '../ui/ZZZButton';
import { useLanguage } from '../../locales';
import { BreakdownRow, formatVal, formatPct, modalOverlayStyle } from './FormulaModal';
import { DISC_SETS } from '../../data';

interface BuildDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  build: BuildResult;
  enemy: EnemyStats;
  skillMultiplier: number;
}

export const BuildDetailsModal: React.FC<BuildDetailsModalProps> = ({ visible, onClose, build, enemy, skillMultiplier }) => {
  const { t, lang } = useLanguage();
  if (!visible || !build) return null;

  const { stats, combo } = build;

  // --- Calculations for Formula ---
  const baseAtk = stats.atkBase;
  const atkPct = stats.atkPercent;
  const flatAtk = stats.atkFlat;
  const finalAtk = baseAtk * (1 + atkPct / 100) + flatAtk;
  const critRate = Math.min(1.0, Math.max(0, stats.critRate / 100));
  const critDmg = stats.critDmg / 100;
  const critMult = 1 + critRate * critDmg;
  const dmgBonus = stats.dmgBonus / 100;
  const dmgMult = 1 + dmgBonus;
  const penRatioVal = stats.penRatio / 100;
  const defReductionVal = (stats.defReduction || 0) / 100;
  const effectiveDef = Math.max(0, enemy.def * (1 - penRatioVal) * (1 - defReductionVal) - stats.penFlat);
  const DEF_COEFF = 794; 
  const defMult = DEF_COEFF / (effectiveDef + DEF_COEFF);
  const resShredVal = (stats.resReduction || 0);
  const effectiveResPct = enemy.res - resShredVal; 
  const effectiveResRatio = effectiveResPct / 100;
  const resMult = 1 - effectiveResRatio;
  const stunMult = enemy.stunned ? (enemy.stunMultiplier ? enemy.stunMultiplier / 100 : 1.5) : 1.0;

  // --- Helper for Disc Visuals (Task 2: CN / EN) ---
  const getLocalizedSetName = (setId: string) => {
    const stdSet = DISC_SETS.find(s => s.id === setId);
    return stdSet ? `${stdSet.name.cn} / ${stdSet.name.en}` : setId;
  };

  const getStatLabel = (statKey: string) => t(`stat_${statKey}`) || statKey;

  // Format Combo Name from ID string if possible, or use raw if it's legacy
  // build.comboName might come as "ID:Count + ID:Count"
  const formatBuildName = (rawName: string) => {
    if (rawName.includes(':')) {
       // Parse ID:Count
       const parts = rawName.split(' + ');
       return parts.map(part => {
           const [id, count] = part.split(':');
           const stdSet = DISC_SETS.find(s => s.id === id);
           const name = stdSet ? `${stdSet.name.cn} / ${stdSet.name.en}` : id;
           return `${name} (${count})`;
       }).join(' + ');
    }
    return rawName;
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{
          background: 'rgba(20, 20, 20, 0.98)',
          border: '2px solid var(--zzz-cyan)',
          boxShadow: '0 0 40px rgba(19, 194, 194, 0.2)',
          padding: '0',
          width: '1000px',
          maxWidth: '95%',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--zzz-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                 <h2 style={{ margin: 0, color: 'var(--zzz-white)', textTransform: 'uppercase', fontStyle: 'italic' }}>
                     {t('build_details')} // {t('build')}
                 </h2>
                 <div style={{ color: 'var(--zzz-cyan)', fontSize: '0.9rem', marginTop: '4px' }}>
                     {t('rank')} #{build.rank} - {formatBuildName(build.comboName)}
                 </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                 <div style={{ color: 'var(--zzz-yellow)', fontSize: '1.5rem', fontWeight: 900 }}>
                     {Math.round(build.dps).toLocaleString()}
                 </div>
                 <div style={{ color: 'var(--zzz-light-grey)', fontSize: '0.8rem' }}>{t('expected_dps')}</div>
             </div>
        </div>

        {/* Content Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            {/* Left: Formula */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--zzz-border)' }}>
                <h4 style={{ color: 'var(--zzz-light-grey)', marginTop: 0, textTransform: 'uppercase' }}>{t('damage_formula')}</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <BreakdownRow label="ATK" value={Math.round(finalAtk)} formula={`${Math.round(baseAtk)} × (1+${stats.atkPercent}%) + ${Math.round(flatAtk)}`} />
                    <BreakdownRow label="Crit Avg" value={formatVal(critMult)} formula={`1 + (${stats.critRate.toFixed(1)}% × ${stats.critDmg.toFixed(1)}%)`} highlight />
                    <BreakdownRow label="DMG Bonus" value={formatVal(dmgMult)} formula={`1 + ${stats.dmgBonus.toFixed(1)}%`} />
                    <BreakdownRow label="DEF Mult" value={formatVal(defMult)} formula={`Coeff / (Def - Pen)`} />
                    <BreakdownRow label="RES Mult" value={formatVal(resMult)} formula={`1 - Res%`} />
                    <BreakdownRow label="Stun Mult" value={formatVal(stunMult)} formula={enemy.stunned ? 'Active' : 'Inactive'} />
                </div>
            </div>

            {/* Right: Visual Discs */}
            <div style={{ flex: 1.5, padding: '24px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)' }}>
                 <h4 style={{ color: 'var(--zzz-light-grey)', marginTop: 0, textTransform: 'uppercase' }}>{t('equipped_discs')}</h4>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                     {combo.map((item, idx) => (
                         <div key={idx} style={{ background: 'var(--zzz-black)', border: '1px solid var(--zzz-grey)', padding: '12px', position: 'relative' }}>
                             <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--zzz-cyan)', color: 'var(--zzz-black)', fontSize: '0.7rem', padding: '2px 6px', fontWeight: 'bold' }}>#{item.slot}</div>
                             <div style={{ color: 'var(--zzz-white)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px' }}>{getLocalizedSetName(item.set)}</div>
                             <div style={{ color: 'var(--zzz-yellow)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                 {getStatLabel(item.mainStat)}
                             </div>
                             {/* Fixed Height Subs in Modal too */}
                             <div style={{ fontSize: '0.75rem', color: '#888', display:'flex', flexDirection:'column', gap:'2px' }}>
                                 {Array.from({ length: 4 }).map((_, i) => {
                                     const s = item.subStats[i];
                                     return s ? (
                                         <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                             <span>{getStatLabel(s.stat)}</span>
                                             <span>{s.value}</span>
                                         </div>
                                     ) : <div key={i} style={{ height: '1.1em' }} />;
                                 })}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--zzz-border)', textAlign: 'right' }}>
            <ZZZButton onClick={onClose}>{t('close_details')}</ZZZButton>
        </div>

      </div>
    </div>
  );
};