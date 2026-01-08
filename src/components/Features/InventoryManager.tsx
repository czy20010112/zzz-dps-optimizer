
import React, { useState, useRef } from 'react';
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

const EXTRA_MAIN_STATS: Record<string, string> = {
  'energy': '20%',
};

export const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, setInventory, customSets = [] }) => {
  const { t, lang } = useLanguage();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscItem | undefined>(undefined);
  
  // State for Import Logic
  const [jsonInput, setJsonInput] = useState('');
  const [importFileName, setImportFileName] = useState(''); // New: Track filename for UI
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatDisplay = (statKey: string) => {
    const label = t(`stat_${statKey}`) || statKey;
    const value = MAIN_STAT_VALUES[statKey as StatType] || EXTRA_MAIN_STATS[statKey];
    return value ? `${label} (+${value})` : label;
  };

  const getLocalizedSetName = (setId: string) => {
    const stdSet = DISC_SETS.find(s => s.id === setId);
    if (stdSet) return stdSet.name[lang];
    const customSet = customSets.find(s => s.id === setId || s.name === setId); // Check ID first
    if (customSet) return customSet.name;
    return setId;
  };

  // Task 2: Normalize IDs from Imports
  const normalizeSetId = (rawSet: string) => {
    // Check against standard sets (ID, Name EN, Name CN)
    const stdSet = DISC_SETS.find(s => s.id === rawSet || s.name.en === rawSet || s.name.cn === rawSet);
    if (stdSet) return stdSet.id;
    // Assume custom set or valid ID
    return rawSet;
  };

  const processImport = (data: any[]) => {
      if (Array.isArray(data)) {
        // Normalize IDs
        const normalized = data.map(item => ({
            ...item,
            set: normalizeSetId(item.set),
            // Ensure ID exists
            id: item.id || crypto.randomUUID() 
        }));
        
        // Append or Replace? Let's Append to avoid data loss, user can purge
        setInventory([...inventory, ...normalized]);
        setShowImportModal(false);
        setJsonInput('');
        setImportFileName('');
      } else {
        alert("Invalid JSON format");
      }
  };

  const handleImportText = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      processImport(parsed);
    } catch (e) {
      alert("JSON Error");
    }
  };

  // Task 3: Trigger hidden file input
  const handleSelectFileClick = () => {
      fileInputRef.current?.click();
  };

  // Task 3: File Import with Filename State
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setImportFileName(file.name); // Update UI

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              // We populate the text area so user can see/edit before parsing, or just parse directly
              setJsonInput(text); 
          } catch (err) {
              alert("Failed to read file");
          }
      };
      reader.readAsText(file);
      // Reset input value so same file can be selected again if needed
      event.target.value = '';
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

  const handleSaveDisc = (newItem: DiscItem) => {
    if (editingItem) {
        // Replace: Use functional update to ensure fresh state
        setInventory(inventory.map(i => i.id === newItem.id ? newItem : i));
        setEditingItem(undefined);
    } else {
        // Add
        setInventory([...inventory, newItem]);
    }
    setShowAddModal(false);
  };

  // Task 1: Robust Delete Handler
  const handleDeleteDisc = (id: string) => {
      // Create new array reference explicitly
      const nextInventory = inventory.filter(i => i.id !== id);
      setInventory(nextInventory);
      
      // Clear Modal State immediately
      setEditingItem(undefined);
      setShowAddModal(false);
  };

  const handleItemClick = (item: DiscItem) => {
      setEditingItem(item);
      setShowAddModal(true);
  };

  // Sorting: Set ID (A-Z) -> Slot (1-6)
  const sortedInventory = [...inventory].sort((a, b) => {
    if (a.set !== b.set) return a.set.localeCompare(b.set);
    return a.slot - b.slot;
  });

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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <ZZZButton onClick={() => { setEditingItem(undefined); setShowAddModal(true); }}>{t('add_disk')}</ZZZButton>
          <ZZZButton onClick={() => setShowImportModal(true)} variant="secondary">{t('import_json')}</ZZZButton>
          <ZZZButton onClick={handleExport} variant="secondary">{t('export')}</ZZZButton>
          <ZZZButton onClick={() => setInventory([])} variant="danger" style={{ marginLeft: 'auto' }}>{t('purge')}</ZZZButton>
        </div>
        
        {/* Grid Layout View */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--zzz-border)', padding: '12px' }}>
          {sortedInventory.length === 0 && (
             <div style={{ color: 'var(--zzz-light-grey)', textAlign: 'center', padding: '24px' }}>NO DATA // EMPTY</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {sortedInventory.map((item, i) => (
                <div 
                    key={item.id || i} // Use ID preference
                    onClick={() => handleItemClick(item)} // Task 3: Edit on click
                    style={{ 
                        background: 'var(--zzz-black)',
                        border: '1px solid var(--zzz-grey)',
                        padding: '12px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--zzz-yellow)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--zzz-grey)'}
                >
                    <div style={{ 
                        position: 'absolute', top: 0, right: 0, 
                        background: 'var(--zzz-yellow)', color: 'var(--zzz-black)', 
                        padding: '2px 6px', fontWeight: 'bold', fontSize: '0.7rem' 
                    }}>
                        #{item.slot}
                    </div>
                    <div style={{ color: 'var(--zzz-white)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.9rem' }}>
                        {getLocalizedSetName(item.set)}
                    </div>
                    <div style={{ color: 'var(--zzz-cyan)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
                        {getStatDisplay(item.mainStat)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--zzz-light-grey)' }}>
                        {item.subStats.map((s, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t(`stat_${s.stat}`) || s.stat}</span>
                                <span>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>
      </ZZZCard>

      {/* --- Add/Edit Disc Modal Component --- */}
      {showAddModal && (
        <AddDiscModal 
          onClose={() => setShowAddModal(false)}
          onConfirm={handleSaveDisc}
          customSets={customSets}
          initialItem={editingItem} // Pass for editing
          onDelete={handleDeleteDisc} // Pass delete handler
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
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={jsonPlaceholder}
              style={{
                width: '100%', height: '200px', background: 'var(--zzz-black)', 
                color: 'var(--zzz-yellow)', border: '1px solid var(--zzz-border)',
                marginBottom: '16px', fontFamily: 'monospace', padding: '10px',
                whiteSpace: 'pre',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Task 3: Styled File Input Section */}
            {/* Hidden Input */}
            <input 
                type="file" 
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            
            {/* Filename feedback */}
            {importFileName && (
                <div style={{ color: 'var(--zzz-cyan)', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'right' }}>
                    FILE SELECTED: {importFileName}
                </div>
            )}

            {/* Single Row Action Bar */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
               <ZZZButton onClick={handleSelectFileClick} variant="secondary" style={{ flex: 1 }}>
                   {t('select_file')}
               </ZZZButton>
               <ZZZButton onClick={() => setShowImportModal(false)} variant="secondary" style={{ flex: 1 }}>
                   {t('cancel')}
               </ZZZButton>
               <ZZZButton onClick={handleImportText} style={{ flex: 1 }}>
                   {t('parse')}
               </ZZZButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
