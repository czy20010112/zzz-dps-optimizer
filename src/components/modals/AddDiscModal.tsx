
import React, { useState, useEffect } from 'react';
import { ZZZButton } from '../ui/ZZZButton';
import { ZZZSelect } from '../ui/ZZZSelect';
import { DiscItem, StatType } from '../../types';
import { useLanguage } from '../../locales';
import { DISC_SETS } from '../../data';

interface AddDiscModalProps {
  onClose: () => void;
  onConfirm: (item: DiscItem) => void;
  // Task 3: Edit/Delete Support
  initialItem?: DiscItem; 
  onDelete?: (id: string) => void;
  customSets?: any[]; 
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

export const AddDiscModal: React.FC<AddDiscModalProps> = ({ onClose, onConfirm, customSets = [], initialItem, onDelete }) => {
  const { t, lang } = useLanguage();
  
  // Initialize with initialItem or defaults
  const [slot, setSlot] = useState(initialItem?.slot || 1);
  const [set, setSet] = useState(initialItem?.set || 'Woodpecker');
  const [mainStat, setMainStat] = useState<StatType>(initialItem?.mainStat || 'hp');
  
  // Task 2: Fix Substat Initialization (Always Show 4 Slots)
  const [subStats, setSubStats] = useState<{stat: StatType, value: string}[]>(() => {
    if (initialItem?.subStats) {
        // Map existing stats
        const existing = initialItem.subStats.map(s => ({ stat: s.stat, value: String(s.value) }));
        // Pad with empty stats until length is 4
        while (existing.length < 4) {
            existing.push({ stat: 'atk_', value: '' });
        }
        return existing;
    }
    // Default empty state
    return [
        { stat: 'atk_', value: '' },
        { stat: 'critRate', value: '' },
        { stat: 'critDmg', value: '' },
        { stat: 'pen', value: '' },
    ];
  });

  // Task 2: Update Main Stat when Slot changes, but only if not editing (or if user changes slot manually)
  useEffect(() => {
    // Logic: If current main stat is invalid for new slot, reset it.
    const validKeys = getMainStatKeys(slot);
    if (!validKeys.includes(mainStat)) {
        if (slot === 1) setMainStat('hp');
        else if (slot === 2) setMainStat('atk');
        else if (slot === 3) setMainStat('def');
        else if (slot === 4) setMainStat('critRate');
        else if (slot === 5) setMainStat('elemental');
        else if (slot === 6) setMainStat('atk_');
    }
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
      'anomaly': lang === 'cn' ? '异常精通' : 'Anomaly Prof', 
    };
    return map[key] || key;
  };

  const allStats = [
    'atk', 'atk_', 'critRate', 'critDmg', 'pen', 'pen_', 
    'elemental', 'hp', 'hp_', 'def', 'def_', 'impact', 'mastery'
  ];

  const getMainStatKeys = (s: number) => {
    if (s === 1) return ['hp'];
    if (s === 2) return ['atk'];
    if (s === 3) return ['def'];
    if (s === 4) return ['critRate', 'critDmg', 'atk_', 'anomaly', 'def_', 'hp_'];
    if (s === 5) return ['elemental', 'pen_', 'atk_', 'def_', 'hp_'];
    if (s === 6) return ['atk_', 'impact', 'mastery', 'energy', 'def_', 'hp_'];
    return [];
  };

  const getMainStatOptions = () => {
    return getMainStatKeys(slot).map(k => ({ label: getLabel(k), value: k }));
  };

  const handleSlotChange = (newSlot: number) => {
    setSlot(newSlot);
  };

  const handleConfirm = () => {
    const validSubs = subStats
      .filter(s => s.value !== '')
      .map(s => ({ stat: s.stat, value: parseFloat(s.value) || 0 }));
    
    onConfirm({
      id: initialItem ? initialItem.id : crypto.randomUUID(), // Preserve ID if editing
      slot,
      set, // Task 2: This is now guaranteed to be ID from select
      mainStat,
      subStats: validSubs
    });
  };

  // Task 1: Fix Delete Functionality
  const handleDelete = () => {
      if (initialItem && onDelete) {
          // Add a simple confirmation to prevent accidents
          if (window.confirm('WARNING: Deleting this disc cannot be undone. Proceed?')) {
              onDelete(initialItem.id);
              // Note: We do NOT need to call onClose() here because onDelete in InventoryManager
              // already sets showAddModal to false. Calling it again is redundant but harmless.
          }
      }
  };

  // Task 2: Fix Set ID binding.
  const setOptions = [
    ...DISC_SETS.map(s => ({ label: s.name[lang], value: s.id })),
    ...customSets.map(s => ({ label: `${s.name} (*)`, value: s.id }))
  ];

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ borderBottom: '2px solid var(--zzz-yellow)', marginBottom: '16px', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: 'var(--zzz-white)', textTransform: 'uppercase' }}>
              {initialItem ? 'EDIT DISC' : t('add_disk')}
          </h3>
          {/* Task 1: Delete Button Visibility Check */}
          {initialItem && onDelete && (
              <button 
                onClick={handleDelete}
                style={{ 
                    background: 'transparent', border: '1px solid var(--zzz-red)', 
                    color: 'var(--zzz-red)', fontWeight: 'bold', cursor: 'pointer',
                    padding: '2px 8px', fontSize: '0.75rem', textTransform: 'uppercase'
                }}
              >
                  DELETE [X]
              </button>
          )}
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
