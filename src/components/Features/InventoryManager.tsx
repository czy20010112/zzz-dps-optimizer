import React, { useState } from 'react';
import { ZZZCard } from '../ui/ZZZCard';
import { ZZZButton } from '../ui/ZZZButton';
import { AddDiscModal } from '../modals/AddDiscModal';
import { DiscItem, CustomSetData, StatType } from '../../types';
import { useLanguage } from '../../locales';
import { DISC_SETS } from '../../data';

interface InventoryManagerProps {
  inventory: DiscItem[];
  setInventory: (items: DiscItem[]) => void;
  customSets?: CustomSetData[];
}

// Standard Level 15 S-Rank Disc Values
const MAIN_STAT_VALUES: Partial<Record<StatType, string>> = {
  'atk_': '30%',
  'hp_': '30%',
  'def_': '30%',
  'elemental': '30%',
  'critRate': '24%',
  'critDmg': '48%',
  'pen_': '24%',
  'mastery': '92',
  'impact': '18',
  'hp': '2200',
  'atk': '316',
};

// Energy is not in StatType usually but sometimes appears in inventory
const EXTRA_MAIN_STATS: Record<string, string> = {
  'energy': '20%',
};

export const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, setInventory, customSets = [] }) => {
  const { t, lang } = useLanguage();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const getStatDisplay = (statKey: string) => {
    const label = t(`stat_${statKey}`) || statKey;
    const value = MAIN_STAT_VALUES[statKey as StatType] || EXTRA_MAIN_STATS[statKey];
    return value ? `${label} (+${value})` : label;
  };

  // Task 2: Strict Single Language Support for Sets
  const getLocalizedSetName = (setId: string) => {
    const stdSet = DISC_SETS.find(s => s.id === setId);
    if (stdSet) return stdSet.name[lang];
    
    // Custom set fallback
    const customSet = customSets.find(s => s.name === setId);
    if (customSet) return customSet.name;

    return setId;
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setInventory(parsed);
        setShowImportModal(false);
        setJsonInput('');
      } else {
        alert("Invalid JSON format");
      }
    } catch (e) {
      alert("JSON Error");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(inventory, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zzz_inventory_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddDisc = (newItem: DiscItem) => {
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
  };

  const jsonPlaceholder = `[
  {
    "id": "demo-disc-1",
    "slot": 4,
    "set": "Woodpecker",
    "mainStat": "critRate",
    "subStats": [
      { "stat": "critDmg", "value": 9.6 },
      { "stat": "atk_", "value": 9.0 }
    ]
  }
]`;

  return (
    <>
      <ZZZCard title={`${t('disk_storage')} [${inventory.length}]`}>
        {/* Task 1: Single Row Layout for Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <ZZZButton onClick={() => setShowAddModal(true)}>{t('add_disk')}</ZZZButton>
          <ZZZButton onClick={() => setShowImportModal(true)} variant="secondary">{t('import')}</ZZZButton>
          <ZZZButton onClick={handleExport} variant="secondary">{t('export')}</ZZZButton>
          <ZZZButton onClick={() => setInventory([])} variant="danger">{t('purge')}</ZZZButton>
        </div>
        
        {/* Grid Layout View */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--zzz-border)', padding: '12px' }}>
          {inventory.length === 0 && (
             <div style={{ color: 'var(--zzz-light-grey)', textAlign: 'center', padding: '24px' }}>NO DATA // EMPTY</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {inventory.map((item, i) => (
                <div key={i} style={{ 
                    background: 'var(--zzz-black)',
                    border: '1px solid var(--zzz-grey)',
                    padding: '12px',
                    position: 'relative'
                }}>
                    <div style={{ 
                        position: 'absolute', top: 0, right: 0, 
                        background: 'var(--zzz-yellow)', color: 'var(--zzz-black)', 
                        padding: '2px 6px', fontWeight: 'bold', fontSize: '0.7rem' 
                    }}>
                        #{item.slot}
                    </div>
                    <div style={{ color: 'var(--zzz-white)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {getLocalizedSetName(item.set)}
                    </div>
                    <div style={{ color: 'var(--zzz-cyan)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 'bold' }}>
                        {getStatDisplay(item.mainStat)}
                    </div>
                    
                    {/* Fixed Height for Substats (Always 4 lines) */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--zzz-light-grey)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const s = item.subStats[idx];
                            if (s) {
                                return (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{t(`stat_${s.stat}`) || s.stat}</span>
                                        <span style={{color: 'var(--zzz-white)'}}>{s.value}</span>
                                    </div>
                                );
                            } else {
                                // Placeholder slot to maintain height
                                return <div key={idx} style={{ height: '1.1em' }}></div>;
                            }
                        })}
                    </div>
                </div>
            ))}
          </div>
        </div>
      </ZZZCard>

      {/* --- Add Disc Modal Component --- */}
      {showAddModal && (
        <AddDiscModal 
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddDisc}
          customSets={customSets}
        />
      )}

      {/* --- Import Modal --- */}
      {showImportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
             background: 'var(--zzz-dark-grey)', border: '2px solid var(--zzz-yellow)',
             padding: '24px', width: '500px', maxWidth: '90%',
             clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}>
            <h3 style={{ color: 'var(--zzz-white)', marginTop: 0 }}>{t('import_json')}</h3>
            <textarea 
              defaultValue={jsonPlaceholder}
              onChange={(e) => setJsonInput(e.target.value)}
              style={{
                width: '100%', height: '200px', background: 'var(--zzz-black)', 
                color: 'var(--zzz-yellow)', border: '1px solid var(--zzz-border)',
                marginBottom: '16px', fontFamily: 'monospace', padding: '10px',
                whiteSpace: 'pre', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
               <ZZZButton onClick={() => setShowImportModal(false)} variant="secondary" style={{ flex: 1 }}>{t('cancel')}</ZZZButton>
               <ZZZButton onClick={handleImport} style={{ flex: 1 }}>{t('parse')}</ZZZButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};