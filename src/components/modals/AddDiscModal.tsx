import React, { useState, useEffect } from 'react';
import { ZZZButton } from '../ui/ZZZButton';
import { ZZZSelect } from '../ui/ZZZSelect';
import { DiscItem, StatType } from '../../types';
import { useLanguage } from '../../locales';
import { DISC_SETS } from '../../data';

interface AddDiscModalProps {
  onClose: () => void;
  onConfirm: (item: DiscItem) => void;
  customSets?: any[]; // Allow custom sets
}

// ZZZ Standard Substat Increment Values
const STEP_VALUES: Record<string, number> = {
  'atk_': 3.0,
  'critRate': 2.4,
  'critDmg': 4.8,
  'pen': 9,
  'atk': 19,
  'hp_': 3.0,
  'def_': 4.8,
  'elemental': 3.0,
  'pen_': 2.4,
  'mastery': 9,
  'impact': 6,
};

export const AddDiscModal: React.FC<AddDiscModalProps> = ({ onClose, onConfirm, customSets = [] }) => {
  const { t, lang } = useLanguage();
  
  const [slot, setSlot] = useState(1);
  const [set, setSet] = useState('Woodpecker');
  const [mainStat, setMainStat] = useState<StatType>('hp');
  const [subStats, setSubStats] = useState<{stat: StatType, value: string}[]>([
    { stat: 'atk_', value: '' },
    { stat: 'critRate', value: '' },
    { stat: 'critDmg', value: '' },
    { stat: 'pen', value: '' },
  ]);

  // Task 2: Update Main Stat when Slot changes
  useEffect(() => {
    if (slot === 1) setMainStat('hp');
    else if (slot === 2) setMainStat('atk');
    else if (slot === 3) setMainStat('def');
    else if (slot === 4) setMainStat('critRate');
    else if (slot === 5) setMainStat('elemental');
    else if (slot === 6) setMainStat('atk_');
  }, [slot]);

  // Localized Labels
  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      'atk': lang === 'cn' ? '小攻击 (Flat)' : 'ATK (Flat)',
      'atk_': lang === 'cn' ? '攻击力 %' : 'ATK %',
      'def': lang === 'cn' ? '防御力 (Flat)' : 'DEF (Flat)',
      'def_': lang === 'cn' ? '防御力 %' : 'DEF %',
      'hp': lang === 'cn' ? '生命值 (Flat)' : 'HP (Flat)',
      'hp_': lang === 'cn' ? '生命值 %' : 'HP %',
      'critRate': lang === 'cn' ? '暴击率' : 'CRIT Rate',
      'critDmg': lang === 'cn' ? '暴击伤害' : 'CRIT DMG',
      'pen': lang === 'cn' ? '穿透值' : 'PEN (Flat)',
      'pen_': lang === 'cn' ? '穿透率' : 'PEN Ratio',
      'elemental': lang === 'cn' ? '属性伤害' : 'Elem DMG',
      'impact': lang === 'cn' ? '冲击力' : 'Impact',
      'mastery': lang === 'cn' ? '异常精通' : 'Mastery',
      'energy': lang === 'cn' ? '能量自动回复' : 'Energy Regen',
      'anomaly': lang === 'cn' ? '异常精通' : 'Anomaly Prof', // Usually 'anomaly' in data types means Prof
    };
    return map[key] || key;
  };

  // Full list for Substats
  const allStats = [
    'atk', 'atk_', 'critRate', 'critDmg', 'pen', 'pen_', 
    'elemental', 'hp', 'hp_', 'def', 'def_', 'impact', 'mastery'
  ];

  // Task 2: Filter Main Stats based on Slot
  const getMainStatOptions = () => {
    let validKeys: string[] = [];
    if (slot === 1) validKeys = ['hp'];
    else if (slot === 2) validKeys = ['atk'];
    else if (slot === 3) validKeys = ['def'];
    else if (slot === 4) validKeys = ['critRate', 'critDmg', 'atk_', 'anomaly', 'def_', 'hp_'];
    else if (slot === 5) validKeys = ['elemental', 'pen_', 'atk_', 'def_', 'hp_'];
    else if (slot === 6) validKeys = ['atk_', 'impact', 'mastery', 'energy', 'def_', 'hp_'];

    return validKeys.map(k => ({ label: getLabel(k), value: k }));
  };

  const handleSlotChange = (newSlot: number) => {
    setSlot(newSlot);
    // Main stat update is handled by useEffect
  };

  const handleConfirm = () => {
    const validSubs = subStats
      .filter(s => s.value !== '')
      .map(s => ({ stat: s.stat, value: parseFloat(s.value) || 0 }));
    
    onConfirm({
      id: crypto.randomUUID(),
      slot,
      set,
      mainStat,
      subStats: validSubs
    });
  };

  const setOptions = [
    ...DISC_SETS.map(s => ({ label: s.name[lang], value: s.id })),
    ...customSets.map(s => ({ label: `${s.name} (*)`, value: s.name }))
  ];

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ borderBottom: '2px solid var(--zzz-yellow)', marginBottom: '16px', paddingBottom: '8px' }}>
          <h3 style={{ margin: 0, color: 'var(--zzz-white)', textTransform: 'uppercase' }}>{t('add_disk')}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>SLOT</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[1,2,3,4,5,6].map(n => (
                <div 
                  key={n}
                  onClick={() => handleSlotChange(n)}
                  style={{
                    padding: '8px', textAlign: 'center', cursor: 'pointer',
                    background: slot === n ? 'var(--zzz-yellow)' : 'var(--zzz-black)',
                    color: slot === n ? 'var(--zzz-black)' : 'var(--zzz-white)',
                    border: '1px solid var(--zzz-border)',
                    fontWeight: 'bold'
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
          <ZZZSelect label="SET BONUS" options={setOptions} value={set} onChange={setSet} />
        </div>

        <div style={{ marginBottom: '24px' }}>
           <label style={labelStyle}>MAIN STAT</label>
           <select 
              value={mainStat} 
              onChange={e => setMainStat(e.target.value as StatType)}
              disabled={slot <= 3}
              style={{ 
                ...selectStyle, 
                opacity: slot <= 3 ? 0.5 : 1,
                cursor: slot <= 3 ? 'not-allowed' : 'pointer'
              }}
           >
             {getMainStatOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
           </select>
        </div>

        <div style={{ background: 'var(--zzz-black)', padding: '16px', border: '1px solid var(--zzz-border)' }}>
          <label style={{ ...labelStyle, color: 'var(--zzz-yellow)', marginBottom: '12px' }}>SUB STATS</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {subStats.map((sub, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
                 <select 
                    value={sub.stat}
                    onChange={e => {
                      const newSubs = [...subStats];
                      newSubs[idx].stat = e.target.value as StatType;
                      setSubStats(newSubs);
                    }}
                    style={selectStyle}
                 >
                   {allStats.map(k => <option key={k} value={k}>{getLabel(k)}</option>)}
                 </select>
                 <input 
                    type="number"
                    placeholder="0"
                    min="0"
                    step={STEP_VALUES[sub.stat] || 1}
                    value={sub.value}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (e.target.value !== '' && val < 0) return; // Prevent negative input
                      
                      const newSubs = [...subStats];
                      newSubs[idx].value = e.target.value;
                      setSubStats(newSubs);
                    }}
                    style={inputStyle}
                 />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
           <ZZZButton onClick={onClose} variant="secondary">{t('cancel')}</ZZZButton>
           <ZZZButton onClick={handleConfirm}>{t('confirm')}</ZZZButton>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Shared ZZZ Modal Look) ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalContentStyle: React.CSSProperties = {
  background: 'var(--zzz-dark-grey)',
  border: '2px solid var(--zzz-white)',
  padding: '24px',
  width: '550px',
  maxWidth: '90%',
  color: 'var(--zzz-white)',
  boxShadow: '0 0 20px rgba(0,0,0,0.8)',
  clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'var(--zzz-light-grey)', fontSize: '0.75rem', 
  marginBottom: '6px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px'
};

const selectStyle: React.CSSProperties = {
  width: '100%', background: 'var(--zzz-dark-grey)', color: 'var(--zzz-white)', 
  border: '1px solid var(--zzz-border)', padding: '8px', 
  fontWeight: 'bold', fontSize: '0.9rem', outline: 'none'
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--zzz-dark-grey)', color: 'var(--zzz-yellow)', 
  border: '1px solid var(--zzz-border)', padding: '8px', 
  fontWeight: 'bold', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
};