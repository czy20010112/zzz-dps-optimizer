import React from 'react';
import { BaseStats, EnemyStats, BuildResult } from '../../types';
import { ZZZButton } from '../ui/ZZZButton';
import { useLanguage } from '../../locales';
import { BreakdownRow, formatVal, modalOverlayStyle } from './FormulaModal';
import { DISC_SETS } from '../../data';
import { applySetBonuses } from '../../utils/statCalculator';

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

  // --- Calculations for Formula (Copied from FormulaModal logic) ---
  const baseAtk = stats.atkBase;
  const atkPct = stats.atkPercent;
  const flatAtk = stats.atkFlat;
  const finalAtk = baseAtk * (1 + atkPct / 100) + flatAtk;
  
  // Crit Cap Logic
  const rawCritRate = stats.critRate / 100;
  const effectiveCritRate = Math.min(1.0, Math.max(0, rawCritRate));
  const isCapped = rawCritRate > 1.0;
  
  const critDmg = stats.critDmg / 100;
  const critMult = 1 + effectiveCritRate * critDmg;
  
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

  // --- Helper for Disc Visuals ---
  const getLocalizedSetName = (setId: string) => {
    const stdSet = DISC_SETS.find(s => s.id === setId);
    return stdSet ? stdSet.name[lang] : setId;
  };

  const getStatLabel = (statKey: string) => t(`stat_${statKey}`) || statKey;

  // --- Active Set Bonuses Calculation ---
  // We use the string returned by optimizer, but we need to localize it.
  const { activeBonuses } = applySetBonuses({ ...stats }, combo);

  // Helper to parse and localize english bonus strings like "Set Name (4): +10% ATK"
  const localizeBonusString = (bonus: string) => {
    if (lang === 'en') return bonus;

    // Regex to capture Name, Count, and Description
    // e.g. "Woodpecker Electro (4): +8% CRIT"
    const regex = /^(.+) \((\d+)\):(.+)$/;
    const match = bonus.match(regex);
    
    if (match) {
        const [, setNameEn, count, desc] = match;
        const setDef = DISC_SETS.find(s => s.name.en === setNameEn);
        const localSetName = setDef ? setDef.name[lang] : setNameEn;
        
        // Translate stats in description
        let localDesc = desc;
        localDesc = localDesc.replace('ATK', t('stat_atk_')); // Approx
        localDesc = localDesc.replace('CRIT', t('stat_critRate'));
        localDesc = localDesc.replace('CDMG', t('stat_critDmg'));
        localDesc = localDesc.replace('DMG', t('stat_dmgBonus'));
        localDesc = localDesc.replace('PEN%', t('stat_penRatio'));
        localDesc = localDesc.replace('AP', t('stat_anomalyProficiency'));
        localDesc = localDesc.replace('ER', t('stat_energy'));

        return `${localSetName} (${count}):${localDesc}`;
    }
    return bonus;
  };

  // --- Localization Keys ---
  const TEXT = {
    formulaTitle: lang === 'cn' ? '伤害乘区详情' : 'Damage Formula Breakdown',
    discsTitle: lang === 'cn' ? '已装备驱动盘' : 'Equipped Discs',
    setBonusesTitle: lang === 'cn' ? '激活套装效果' : 'Active Set Bonuses',
    atkArea: lang === 'cn' ? '攻击区' : 'ATK Area',
    critArea: lang === 'cn' ? '双暴区' : 'Crit Area',
    dmgArea: lang === 'cn' ? '增伤区' : 'DMG Bonus',
    defArea: lang === 'cn' ? '防御区' : 'DEF Mult',
    resArea: lang === 'cn' ? '抗性区' : 'RES Mult',
    stunArea: lang === 'cn' ? '失衡区' : 'Stun Mult',
    rank: lang === 'cn' ? '排名' : 'RANK',
    expectedDps: lang === 'cn' ? '期望伤害 (DPS)' : 'EXPECTED DPS',
    buildDetails: lang === 'cn' ? '配装详情' : 'BUILD DETAILS',
    close: lang === 'cn' ? '关闭' : 'CLOSE DETAILS',
    capped: lang === 'cn' ? '(溢出)' : '(MAX 100%)'
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
                     {TEXT.buildDetails}
                 </h2>
                 <div style={{ color: 'var(--zzz-cyan)', fontSize: '0.9rem', marginTop: '4px' }}>
                     {TEXT.rank} #{build.rank} - {build.comboName}
                 </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                 <div style={{ color: 'var(--zzz-yellow)', fontSize: '1.5rem', fontWeight: 900 }}>
                     {Math.round(build.dps).toLocaleString()}
                 </div>
                 <div style={{ color: 'var(--zzz-light-grey)', fontSize: '0.8rem' }}>{TEXT.expectedDps}</div>
             </div>
        </div>

        {/* Content Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            {/* Left: Formula Breakdown */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--zzz-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ color: 'var(--zzz-light-grey)', marginTop: 0, marginBottom: '12px', textTransform: 'uppercase' }}>{TEXT.formulaTitle}</h4>
                
                <BreakdownRow 
                    label={TEXT.atkArea} 
                    value={Math.round(finalAtk)} 
                    formula={`${Math.round(baseAtk)} × (1+${stats.atkPercent}%) + ${Math.round(flatAtk)}`} 
                />
                <BreakdownRow 
                    label={TEXT.critArea} 
                    value={formatVal(critMult)} 
                    formula={
                        <span>
                            1 + ({stats.critRate.toFixed(1)}% {isCapped && <span style={{color:'var(--zzz-red)', fontWeight:'bold'}}>{TEXT.capped}</span>} × {stats.critDmg.toFixed(1)}%)
                        </span>
                    } 
                    highlight 
                />
                <BreakdownRow 
                    label={TEXT.dmgArea} 
                    value={formatVal(dmgMult)} 
                    formula={`1 + ${stats.dmgBonus.toFixed(1)}%`} 
                />
                <BreakdownRow 
                    label={TEXT.defArea} 
                    value={formatVal(defMult)} 
                    formula={`Coeff / (Def - Pen)`} 
                />
                <BreakdownRow 
                    label={TEXT.resArea} 
                    value={formatVal(resMult)} 
                    formula={`1 - Res%`} 
                />
                <BreakdownRow 
                    label={TEXT.stunArea} 
                    value={formatVal(stunMult)} 
                    formula={enemy.stunned ? 'Active' : 'Inactive'} 
                />
            </div>

            {/* Right: Visual Discs & Set Bonuses */}
            <div style={{ flex: 1.5, padding: '24px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
                 
                 {/* Discs Grid */}
                 <h4 style={{ color: 'var(--zzz-light-grey)', marginTop: 0, marginBottom: '12px', textTransform: 'uppercase' }}>{TEXT.discsTitle}</h4>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                     {combo.map((item, idx) => (
                         <div key={idx} style={{ background: 'var(--zzz-black)', border: '1px solid var(--zzz-grey)', padding: '12px', position: 'relative' }}>
                             <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--zzz-cyan)', color: 'var(--zzz-black)', fontSize: '0.7rem', padding: '2px 6px', fontWeight: 'bold' }}>#{item.slot}</div>
                             <div style={{ color: 'var(--zzz-white)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px' }}>{getLocalizedSetName(item.set)}</div>
                             <div style={{ color: 'var(--zzz-yellow)', fontSize: '0.9rem', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>
                                 {getStatLabel(item.mainStat)}
                             </div>
                             <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                 {item.subStats.map((s, i) => (
                                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                         <span>{getStatLabel(s.stat)}</span>
                                         <span>{s.value}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>

                 {/* Active Set Bonuses */}
                 <h4 style={{ color: 'var(--zzz-light-grey)', marginTop: 0, marginBottom: '12px', textTransform: 'uppercase' }}>{TEXT.setBonusesTitle}</h4>
                 <div style={{ 
                    background: 'var(--zzz-dark-grey)', 
                    border: '1px solid var(--zzz-yellow)', 
                    padding: '16px',
                    clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)'
                 }}>
                    {activeBonuses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeBonuses.map((bonus, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--zzz-yellow)' }} />
                                    <span style={{ color: 'var(--zzz-white)', fontWeight: 'bold' }}>{localizeBonusString(bonus)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span style={{ color: 'var(--zzz-light-grey)', fontStyle: 'italic' }}>No set bonuses active (Rainbow Build)</span>
                    )}
                 </div>

            </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--zzz-border)', textAlign: 'right' }}>
            <ZZZButton onClick={onClose}>{TEXT.close}</ZZZButton>
        </div>

      </div>
    </div>
  );
};