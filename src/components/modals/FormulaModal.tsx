import React from 'react';
import { BaseStats, EnemyStats, OptimizationResult } from '../../types';
import { ZZZButton } from '../ui/ZZZButton';
import { useLanguage } from '../../locales';

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
  const { t } = useLanguage();
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
            伤害计算详情 // FORMULA
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
          伤害 = 攻击区 × 倍率区 × 双暴区 × 增伤区 × 防御区 × 抗性区 × 失衡区
        </div>

        {/* Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '8px' }}>
          
          <BreakdownRow 
            label="攻击区 (ATK)" 
            value={Math.round(finalAtk)} 
            formula={`${Math.round(baseAtk)} × (1 + ${stats.atkPercent}%) + ${Math.round(flatAtk)}${isTheoretical ? ` [${t('incl_slot_2')}]` : ''}`} 
          />
          
          <BreakdownRow 
            label="倍率区 (Motion Value)" 
            value={formatPct(SKILL_MV)} 
            formula={`${formatPct(SKILL_MV)} (Used in Calculation)`} 
          />

          <BreakdownRow 
            label="双暴区 (Crit Avg)" 
            value={formatVal(critMult)} 
            formula={`1 + (${stats.critRate.toFixed(1)}% × ${stats.critDmg.toFixed(1)}%)`} 
            highlight
          />

          <BreakdownRow 
            label="增伤区 (DMG Bonus)" 
            value={formatVal(dmgMult)} 
            formula={`1 + ${stats.dmgBonus.toFixed(1)}%`} 
          />

          <BreakdownRow 
            label="抗性区 (RES)" 
            value={formatVal(resMult)} 
            formula={`1 - (${enemy.res}% - ${stats.resReduction || 0}%)`} 
          />

          <BreakdownRow 
            label="失衡区 (Stun)" 
            value={formatVal(stunMult)} 
            formula={enemy.stunned ? `Stunned (x${formatPct(stunMult)})` : 'Active (100%)'} 
          />

          {/* Set Bonuses Row */}
          {result.activeSetBonuses && result.activeSetBonuses.length > 0 && (
              <div style={{ 
                background: 'var(--zzz-dark-grey)', padding: '10px', 
                borderLeft: '4px solid var(--zzz-cyan)', marginBottom: '8px' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--zzz-cyan)', fontSize: '0.9rem' }}>{t('set_bonuses')} / CONFIG</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--zzz-white)', marginTop: '4px' }}>
                    {result.activeSetBonuses.join(' + ')}
                  </span>
                  {isTheoretical && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--zzz-light-grey)', marginTop: '2px' }}>
                        * {t('main_stat_fixed')} & {t('main_stat_selected')}
                    </span>
                  )}
                </div>
              </div>
          )}

          {/* Special Defense Row */}
          <div style={{ background: 'var(--zzz-dark-grey)', padding: '12px', border: '1px solid var(--zzz-border)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--zzz-yellow)' }}>防御区 (DEF)</span>
                <span style={{ fontWeight: 'bold', color: 'var(--zzz-white)' }}>{formatVal(defMult)}</span>
             </div>
             <div style={{ fontSize: '0.75rem', color: 'var(--zzz-light-grey)', marginBottom: '4px' }}>
                公式: {defCoefficient} / (防御 * (1-穿透) * (1-减防) - 固定穿透 + {defCoefficient})
             </div>
             <div style={{ fontSize: '0.8rem', color: 'var(--zzz-white)', fontFamily: 'monospace' }}>
                {defCoefficient} / ({enemy.def} * (1 - {stats.penRatio.toFixed(1)}%) * (1 - {(stats.defReduction || 0).toFixed(1)}%) - {stats.penFlat} + {defCoefficient})
             </div>
             <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--zzz-cyan)' }}>
                有效防御: {Math.round(effectiveDef)} (减伤 {(100 - defMult*100).toFixed(1)}%)
             </div>
          </div>

        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <ZZZButton onClick={onClose} block>CLOSE REPORT</ZZZButton>
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