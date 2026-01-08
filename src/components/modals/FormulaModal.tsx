
import React from 'react';
import { BaseStats, EnemyStats, OptimizationResult } from '../../types';
import { ZZZButton } from '../ui/ZZZButton';
import { useLanguage } from '../../locales';
import { DISC_SETS } from '../../data';

interface FormulaModalProps {
  visible: boolean;
  onClose: () => void;
  result: OptimizationResult | null;
  enemy: EnemyStats;
}

// Export Helper for use in BuildDetailsModal
export const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });
export const formatPct = (n: number) => (n * 100).toFixed(1) + '%';
export const formatVal = (n: number) => n.toFixed(3);

export const FormulaModal: React.FC<FormulaModalProps> = ({ visible, onClose, result, enemy }) => {
  const { t, lang } = useLanguage();
  if (!visible || !result) return null;

  const { stats } = result;

  // --- Calculation Replication for Display ---
  const baseAtk = stats.atkBase;
  const atkPct = stats.atkPercent;
  const flatAtk = stats.atkFlat;
  const finalAtk = baseAtk * (1 + atkPct / 100) + flatAtk;

  const SKILL_MV = result.skillMultiplier ?? 25.0; 

  const critRate = Math.min(1.0, Math.max(0, stats.critRate / 100));
  const critDmg = stats.critDmg / 100;
  const critMult = 1 + critRate * critDmg;

  const dmgBonus = stats.dmgBonus / 100;
  const dmgMult = 1 + dmgBonus;

  // Def
  const penRatioVal = stats.penRatio / 100;
  const defReductionVal = (stats.defReduction || 0) / 100;

  const effectiveDef = Math.max(0, enemy.def * (1 - penRatioVal) * (1 - defReductionVal) - stats.penFlat);
  const DEF_COEFF = 794; 
  const defCoefficient = DEF_COEFF;
  const defMult = defCoefficient / (effectiveDef + DEF_COEFF);

  // Res
  const resShredVal = (stats.resReduction || 0);
  const effectiveResPct = enemy.res - resShredVal; 
  const effectiveResRatio = effectiveResPct / 100;
  
  const resMult = 1 - effectiveResRatio;

  // Stun
  const stunMult = enemy.stunned ? (enemy.stunMultiplier ? enemy.stunMultiplier / 100 : 1.5) : 1.0;

  // Check if theoretical mode active set bonuses contain info
  const isTheoretical = result.activeSetBonuses?.some(s => s.startsWith('Theoretical'));
  const isRaw = result.activeSetBonuses?.some(s => s.includes('Raw') || s.includes('Direct'));

  // Copy of Localize Function from BuildDetails (Standardize this in utils if needed later)
  const localizeBonusString = (bonus: string) => {
    if (lang === 'en') return bonus;
    const regex = /^(.+) \((\d+)\):(.+)$/;
    const match = bonus.match(regex);
    if (match) {
        const [, setNameEn, count, desc] = match;
        const setDef = DISC_SETS.find(s => s.name.en === setNameEn);
        const localSetName = setDef ? setDef.name[lang] : setNameEn;
        
        // Translate stats in description (Simplified Map)
        let localDesc = desc;
        localDesc = localDesc.replace('ATK', t('stat_atk_'));
        localDesc = localDesc.replace('CRIT', t('stat_critRate'));
        localDesc = localDesc.replace('CDMG', t('stat_critDmg'));
        localDesc = localDesc.replace('DMG', t('stat_dmgBonus'));
        localDesc = localDesc.replace('PEN%', t('stat_penRatio'));
        
        return `${localSetName} (${count}):${localDesc}`;
    }
    return bonus;
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* Header */}
        <div style={{ 
          borderBottom: '2px solid var(--zzz-yellow)', 
          marginBottom: '20px', 
          paddingBottom: '10px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: 'var(--zzz-white)', textTransform: 'uppercase', fontStyle: 'italic' }}>
            {lang === 'cn' ? '伤害乘区详情' : 'FORMULA DETAILS'}
          </h2>
          <div style={{ color: 'var(--zzz-yellow)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {Math.round(result.dps).toLocaleString()}
          </div>
        </div>

        {/* Master Formula */}
        <div style={{ 
          background: 'rgba(0,0,0,0.5)', 
          padding: '12px', 
          marginBottom: '20px', 
          border: '1px dashed var(--zzz-grey)',
          fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--zzz-cyan)',
          textAlign: 'center'
        }}>
          {t('formula_desc')}
        </div>

        {/* Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <BreakdownRow 
            label={lang === 'cn' ? '攻击区' : 'ATK Area'}
            value={Math.round(finalAtk)} 
            formula={`${Math.round(baseAtk)} × (1 + ${stats.atkPercent}%) + ${Math.round(flatAtk)}${isTheoretical ? ` [${t('incl_slot_2')}]` : ''}`} 
          />
          
          <BreakdownRow 
            label={lang === 'cn' ? '倍率区' : 'Motion Value'}
            value={formatPct(SKILL_MV)} 
            formula={`${formatPct(SKILL_MV)}`} 
          />

          <BreakdownRow 
            label={lang === 'cn' ? '双暴区' : 'Crit Area'} 
            value={formatVal(critMult)} 
            formula={`1 + (${stats.critRate.toFixed(1)}% × ${stats.critDmg.toFixed(1)}%)`} 
            highlight
          />

          <BreakdownRow 
            label={lang === 'cn' ? '增伤区' : 'DMG Bonus'}
            value={formatVal(dmgMult)} 
            formula={`1 + ${stats.dmgBonus.toFixed(1)}%`} 
          />

          <BreakdownRow 
            label={lang === 'cn' ? '抗性区' : 'RES Mult'}
            value={formatVal(resMult)} 
            formula={`1 - (${enemy.res}% - ${stats.resReduction || 0}%)`} 
          />

          {/* Reordered: DEF Area Above Set Bonuses */}
          {/* Special Defense Row: Styled to match BreakdownRow */}
          <div style={{ 
            background: 'var(--zzz-black)', padding: '10px', 
            borderLeft: '4px solid var(--zzz-grey)', 
            display: 'flex', flexDirection: 'column'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--zzz-white)', fontSize: '0.9rem' }}>{lang === 'cn' ? '防御区' : 'DEF Area'}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--zzz-white)' }}>{formatVal(defMult)}</span>
             </div>
             
             <div style={{ fontSize: '0.75rem', color: 'var(--zzz-light-grey)', marginBottom: '4px', fontStyle: 'italic' }}>
                {t('formula_equation')}
             </div>
             
             <div style={{ fontSize: '0.75rem', color: 'var(--zzz-light-grey)', fontFamily: 'italic', marginBottom: '4px' }}>
                {defCoefficient} / ({enemy.def} * (1 - {stats.penRatio.toFixed(1)}%) * (1 - {(stats.defReduction || 0).toFixed(1)}%) - {stats.penFlat} + {defCoefficient})
             </div>
             
             <div style={{ fontSize: '0.75rem', color: 'var(--zzz-cyan)' }}>
                {t('effective_def')}: {Math.round(effectiveDef)} ({t('dmg_reduction')} {(100 - defMult*100).toFixed(1)}%)
             </div>
          </div>

          <BreakdownRow 
            label={lang === 'cn' ? '失衡区' : 'Stun Mult'}
            value={formatVal(stunMult)} 
            formula={enemy.stunned ? `Stunned (x${formatPct(stunMult)})` : 'Active (100%)'} 
          />

          {/* Set Bonuses Row: Hidden in Raw Mode */}
          {!isRaw && result.activeSetBonuses && result.activeSetBonuses.length > 0 && (
              <div style={{ 
                background: 'var(--zzz-dark-grey)', padding: '10px', 
                borderLeft: '4px solid var(--zzz-cyan)', marginBottom: '8px' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--zzz-cyan)', fontSize: '0.9rem' }}>{t('set_bonuses')} / CONFIG</span>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px', gap: '4px' }}>
                    {/* Localization and Splitting */}
                    {result.activeSetBonuses.map((bonus, idx) => (
                        <span key={idx} style={{ fontSize: '0.8rem', color: 'var(--zzz-white)' }}>
                             • {localizeBonusString(bonus)}
                        </span>
                    ))}
                  </div>
                  {isTheoretical && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--zzz-light-grey)', marginTop: '2px' }}>
                        * {t('main_stat_fixed')} & {t('main_stat_selected')}
                    </span>
                  )}
                </div>
              </div>
          )}

        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <ZZZButton onClick={onClose} block>关闭报告</ZZZButton>
        </div>

      </div>
    </div>
  );
};

// Exported for reuse
export const BreakdownRow = ({ label, value, formula, highlight = false }: any) => (
  <div style={{ 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--zzz-black)', padding: '10px', 
    borderLeft: highlight ? '4px solid var(--zzz-yellow)' : '4px solid var(--zzz-grey)' 
  }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontWeight: 'bold', color: 'var(--zzz-white)', fontSize: '0.9rem' }}>{label}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--zzz-light-grey)' }}>{formula}</span>
    </div>
    <div style={{ fontWeight: 'bold', color: highlight ? 'var(--zzz-yellow)' : 'var(--zzz-white)' }}>
      {value}
    </div>
  </div>
);

export const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)',
  zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export const modalContentStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 20, 0.95)',
  border: '1px solid var(--zzz-border)',
  boxShadow: '0 0 30px rgba(0,0,0,1)',
  padding: '24px',
  width: '500px',
  maxWidth: '95%',
  clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
};
