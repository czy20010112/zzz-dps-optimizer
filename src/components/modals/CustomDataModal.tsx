
import React, { useState, useEffect } from 'react';
import { ZZZButton } from '../ui/ZZZButton';
import { ZZZInput } from '../ui/ZZZInput';
import { ZZZSelect } from '../ui/ZZZSelect';
import { AgentData, EngineData, CustomSetData, StatType } from '../../types';
import { useLanguage } from '../../locales';
import { DISC_SETS } from '../../data';

interface CustomDataModalProps {
  onClose: () => void;
  onSaveAgent: (agent: AgentData) => void;
  onSaveEngine: (engine: EngineData) => void;
  onSaveSet: (set: CustomSetData) => void;
  initialData?: {
    agent?: AgentData;
    engine?: EngineData;
  };
  // Pass existing custom sets to the modal for selection/editing logic
  customSets?: CustomSetData[];
}

export const CustomDataModal: React.FC<CustomDataModalProps> = ({ 
  onClose, onSaveAgent, onSaveEngine, onSaveSet, initialData, customSets = [] 
}) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'agent' | 'engine' | 'set'>('agent');
  
  const txt = (en: string, cn: string) => (lang === 'cn' ? cn : en);

  // Dynamic Stat Options using i18n
  const getStatOptions = () => [
    { label: `${t('stat_atkPercent')} (ATK%)`, value: 'atk_' },
    { label: `${t('stat_critRate')} (CR)`, value: 'critRate' },
    { label: `${t('stat_critDmg')} (CD)`, value: 'critDmg' },
    { label: `${t('stat_penRatio')} (PEN%)`, value: 'pen_' },
    { label: `${t('stat_pen')} (Flat)`, value: 'pen' },
    { label: `${t('stat_dmgBonus')} (Elem)`, value: 'elemental' },
    { label: `${t('stat_atk')} (Flat)`, value: 'atk' },
    { label: `${t('stat_impact')}`, value: 'impact' },
    { label: `${t('stat_anomalyMastery')}`, value: 'mastery' },
    { label: `${t('stat_anomalyProficiency')}`, value: 'anomaly' },
    { label: `${t('stat_energy')}`, value: 'energy' },
    { label: `${t('stat_resReduction')}`, value: 'resReduction' },
    { label: `${t('stat_defReduction')}`, value: 'defReduction' },
  ];

  // -- Agent State --
  const [agentName, setAgentName] = useState('');
  const [agentBase, setAgentBase] = useState({ atk: 800, critRate: 5, critDmg: 50 });
  const [skillMultiplier, setSkillMultiplier] = useState(1000);
  const [agentBuffs, setAgentBuffs] = useState<{stat: StatType, value: string}[]>([]);
  const [agentCopyMode, setAgentCopyMode] = useState(false);

  // -- Engine State --
  const [engineName, setEngineName] = useState('');
  const [engineBaseAtk, setEngineBaseAtk] = useState(600);
  const [engineBuffs, setEngineBuffs] = useState<{stat: StatType, value: string}[]>([]);
  const [engineCopyMode, setEngineCopyMode] = useState(false);

  // -- Set State --
  const [selectedSetId, setSelectedSetId] = useState('');
  const [setName, setSetName] = useState('');
  const [pieces2, setPieces2] = useState<{stat: StatType, value: string}[]>([{ stat: 'atk_', value: '10' }]);
  const [pieces4, setPieces4] = useState<{stat: StatType, value: string}[]>([{ stat: 'critRate', value: '8' }]);

  // -- Initialization Logic --
  useEffect(() => {
    // 1. Initialize Agent
    if (initialData?.agent) {
      const a = initialData.agent;
      const isCustom = a.id.startsWith('custom_');
      setAgentCopyMode(!isCustom);

      let rawName = lang === 'cn' ? a.name.cn : a.name.en;
      if (isCustom) rawName = rawName.replace(' (Custom)', '').replace(' (自定义)', '');
      setAgentName(rawName);

      setAgentBase({
        atk: a.stats.atkBase || 0,
        critRate: a.stats.critRate || 5,
        critDmg: a.stats.critDmg || 50
      });

      if ((a.stats as any).extra?.skillMultiplier) {
        setSkillMultiplier((a.stats as any).extra.skillMultiplier);
      }

      const buffs: {stat: StatType, value: string}[] = [];
      const additives: StatType[] = ['atk_', 'elemental', 'pen_', 'pen', 'resReduction', 'defReduction', 'impact', 'mastery'];
      additives.forEach(key => {
         let mapKey = key;
         if (key === 'atk_') mapKey = 'atkPercent' as any;
         if (key === 'elemental') mapKey = 'dmgBonus' as any;
         if (key === 'pen_') mapKey = 'penRatio' as any;
         if (key === 'pen') mapKey = 'penFlat' as any;
         if (key === 'mastery') mapKey = 'anomalyMastery' as any;
         
         const val = (a.stats as any)[mapKey];
         if (val) buffs.push({ stat: key, value: val.toString() });
      });
      setAgentBuffs(buffs);
      setActiveTab('agent');
    }

    // 2. Initialize Engine
    if (initialData?.engine) {
      const e = initialData.engine;
      const isCustom = e.id.startsWith('custom_');
      setEngineCopyMode(!isCustom);

      let rawName = lang === 'cn' ? e.name.cn : e.name.en;
      if (isCustom) rawName = rawName.replace(' (Custom)', '').replace(' (自定义)', '');
      setEngineName(rawName);
      setEngineBaseAtk(e.stats.atkBase || 0);

      const buffs: {stat: StatType, value: string}[] = [];
      const additives: StatType[] = ['atk_', 'critRate', 'critDmg', 'elemental', 'impact', 'pen_', 'pen', 'resReduction', 'defReduction'];
      additives.forEach(key => {
         let mapKey = key;
         if (key === 'atk_') mapKey = 'atkPercent' as any;
         if (key === 'elemental') mapKey = 'dmgBonus' as any;
         if (key === 'pen_') mapKey = 'penRatio' as any;
         if (key === 'pen') mapKey = 'penFlat' as any;
         
         const val = (e.stats as any)[mapKey];
         if (val) buffs.push({ stat: key, value: val.toString() });
      });
      setEngineBuffs(buffs);
      
      if (!initialData.agent) setActiveTab('engine');
    }
  }, [initialData, lang]);

  // -- Helpers --
  const addBuff = (setter: any, list: any[]) => setter([...list, { stat: 'atk_', value: '' }]);
  const updateBuff = (setter: any, list: any[], idx: number, key: string, val: string) => {
    const n = [...list];
    (n[idx] as any)[key] = val;
    setter(n);
  };
  const removeBuff = (setter: any, list: any[], idx: number) => setter(list.filter((_, i) => i !== idx));

  // -- Set Selection & Population Logic (Task 2) --
  const handleSetSelect = (id: string) => {
    setSelectedSetId(id);
    
    // Find in System or Custom
    const systemSet = DISC_SETS.find(s => s.id === id);
    const customSet = customSets.find(s => s.id === id);

    if (systemSet) {
        setSetName(systemSet.name[lang]);
        
        // Convert System Object {atkPercent: 10} -> Editor Array [{stat:'atk_', value:10}]
        const convert = (obj?: Partial<any>) => {
            if (!obj) return [];
            const arr: any[] = [];
            Object.entries(obj).forEach(([k, v]) => {
                let statKey: StatType = 'atk_';
                if (k === 'atkPercent') statKey = 'atk_';
                else if (k === 'critRate') statKey = 'critRate';
                else if (k === 'critDmg') statKey = 'critDmg';
                else if (k === 'dmgBonus') statKey = 'elemental';
                else if (k === 'penRatio') statKey = 'pen_';
                else if (k === 'anomalyProficiency') statKey = 'anomaly';
                else if (k === 'energy') statKey = 'energy';
                
                arr.push({ stat: statKey, value: String(v) });
            });
            return arr;
        };
        setPieces2(convert(systemSet.stats2pc));
        setPieces4(convert(systemSet.stats4pc));

    } else if (customSet) {
        setSetName(customSet.name);
        setPieces2(customSet.pieces2.map(p => ({ ...p, value: String(p.value) })));
        setPieces4(customSet.pieces4.map(p => ({ ...p, value: String(p.value) })));
    }
  };

  const handleSaveSet = () => {
    let finalId = selectedSetId;
    const isSystem = DISC_SETS.some(s => s.id === selectedSetId);
    if (isSystem || !finalId) {
        finalId = `custom_${Date.now()}`; 
    }

    onSaveSet({
      id: finalId,
      name: setName,
      pieces2: pieces2.map(p => ({ stat: p.stat, value: parseFloat(p.value) || 0 })),
      pieces4: pieces4.map(p => ({ stat: p.stat, value: parseFloat(p.value) || 0 }))
    });
    onClose();
  };

  const handleSaveAgent = () => {
    const stats: any = { 
      atkBase: agentBase.atk, 
      critRate: agentBase.critRate, 
      critDmg: agentBase.critDmg,
    };
    agentBuffs.forEach(b => {
      if(b.value) {
        const val = parseFloat(b.value);
        if (b.stat === 'atk_') stats.atkPercent = (stats.atkPercent || 0) + val;
        else if (b.stat === 'elemental') stats.dmgBonus = (stats.dmgBonus || 0) + val;
        else if (b.stat === 'critRate') stats.critRate = (stats.critRate || 0) + val; 
        else if (b.stat === 'critDmg') stats.critDmg = (stats.critDmg || 0) + val; 
        else if (b.stat === 'pen_') stats.penRatio = (stats.penRatio || 0) + val;
        else if (b.stat === 'pen') stats.penFlat = (stats.penFlat || 0) + val;
        else if (b.stat === 'impact') stats.impact = (stats.impact || 0) + val;
        else if (b.stat === 'mastery') stats.anomalyMastery = (stats.anomalyMastery || 0) + val;
        else if (b.stat === 'anomaly') stats.anomalyProficiency = (stats.anomalyProficiency || 0) + val;
        else if (b.stat === 'resReduction') stats.resReduction = (stats.resReduction || 0) + val;
        else if (b.stat === 'defReduction') stats.defReduction = (stats.defReduction || 0) + val;
      }
    });
    const id = (initialData?.agent && !agentCopyMode) ? initialData.agent.id : `custom_a_${Date.now()}`;
    onSaveAgent({
      id: id, 
      name: { en: `${agentName} (Custom)`, cn: `${agentName} (自定义)` },
      stats: { ...stats, extra: { skillMultiplier } } as any
    });
    onClose();
  };

  const handleSaveEngine = () => {
    const stats: any = { atkBase: engineBaseAtk };
    engineBuffs.forEach(b => {
      if(b.value) {
        const val = parseFloat(b.value);
        if (b.stat === 'atk_') stats.atkPercent = (stats.atkPercent || 0) + val;
        else if (b.stat === 'critRate') stats.critRate = (stats.critRate || 0) + val;
        else if (b.stat === 'critDmg') stats.critDmg = (stats.critDmg || 0) + val;
        else if (b.stat === 'elemental') stats.dmgBonus = (stats.dmgBonus || 0) + val;
        else if (b.stat === 'pen_') stats.penRatio = (stats.penRatio || 0) + val;
        else if (b.stat === 'pen') stats.penFlat = (stats.penFlat || 0) + val;
        else if (b.stat === 'resReduction') stats.resReduction = (stats.resReduction || 0) + val;
        else if (b.stat === 'defReduction') stats.defReduction = (stats.defReduction || 0) + val;
      }
    });
    const id = (initialData?.engine && !engineCopyMode) ? initialData.engine.id : `custom_e_${Date.now()}`;
    onSaveEngine({
      id: id,
      name: { en: `${engineName} (Custom)`, cn: `${engineName} (自定义)` },
      stats
    });
    onClose();
  };

  const renderStatList = (title: string, items: any[], setter: any) => (
    <div style={{ marginTop: '16px', borderTop: '1px dashed var(--zzz-grey)', paddingTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <label style={labelStyle}>{title}</label>
        <button 
          onClick={() => addBuff(setter, items)} 
          style={{ 
            background: 'transparent', border: '1px solid var(--zzz-yellow)', color: 'var(--zzz-yellow)',
            cursor: 'pointer', fontSize: '0.7rem', padding: '2px 8px', fontWeight: 'bold'
          }}
        >
          + {t('add_stat')}
        </button>
      </div>
      <div style={{ paddingRight: '4px' }}>
        {items.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 30px', gap: '8px', marginBottom: '8px' }}>
            <select 
              style={selectStyle} 
              value={b.stat} 
              onChange={e => updateBuff(setter, items, i, 'stat', e.target.value)}
            >
              {getStatOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input 
              style={inputStyle} 
              type="number" 
              placeholder="Val" 
              value={b.value} 
              onChange={e => updateBuff(setter, items, i, 'value', e.target.value)} 
            />
            <button 
              onClick={() => removeBuff(setter, items, i)} 
              style={{ 
                background: 'var(--zzz-red)', border: 'none', color: 'white', 
                cursor: 'pointer', fontWeight: 'bold' 
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* Header Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', borderBottom: '2px solid var(--zzz-border)' }}>
            <div style={{ display: 'flex', width: '100%' }}>
            {[
                { key: 'agent', label: t('agent') },
                { key: 'engine', label: t('w_engine') },
                { key: 'set', label: t('disk_storage').split(' // ')[0] } 
            ].map((tab) => (
                <div 
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                    flex: 1, textAlign: 'center', padding: '12px', cursor: 'pointer',
                    fontWeight: 900, textTransform: 'uppercase',
                    background: activeTab === tab.key ? 'var(--zzz-yellow)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--zzz-black)' : 'var(--zzz-light-grey)'
                }}
                >
                {tab.label}
                </div>
            ))}
            </div>
        </div>

        {/* Copy Mode Indicator */}
        {((activeTab === 'agent' && agentCopyMode) || (activeTab === 'engine' && engineCopyMode)) && (
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', color: 'var(--zzz-cyan)', 
                padding: '8px', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center' 
            }}>
                {t('template_mode')}
            </div>
        )}

        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
          {activeTab === 'agent' && (
            <>
              <ZZZInput label={t('agent')} value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Name..." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ZZZInput label={t('base_atk')} type="number" value={agentBase.atk} onChange={e => setAgentBase({...agentBase, atk: parseFloat(e.target.value)})} />
                <ZZZInput label={t('skill_mult')} type="number" value={skillMultiplier} onChange={e => setSkillMultiplier(parseFloat(e.target.value))} style={{ borderColor: 'var(--zzz-cyan)' }} />
              </div>
              {/* Corrected Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ZZZInput label={t('stat_critRate') + ' (Base)'} type="number" value={agentBase.critRate} onChange={e => setAgentBase({...agentBase, critRate: parseFloat(e.target.value)})} />
                <ZZZInput label={t('stat_critDmg') + ' (Base)'} type="number" value={agentBase.critDmg} onChange={e => setAgentBase({...agentBase, critDmg: parseFloat(e.target.value)})} />
              </div>
              {renderStatList(t('custom_data'), agentBuffs, setAgentBuffs)}
            </>
          )}

          {activeTab === 'engine' && (
            <>
              <ZZZInput label={t('w_engine')} value={engineName} onChange={e => setEngineName(e.target.value)} />
              <ZZZInput label={t('base_atk')} type="number" value={engineBaseAtk} onChange={e => setEngineBaseAtk(parseFloat(e.target.value))} />
              {renderStatList(t('custom_data'), engineBuffs, setEngineBuffs)}
            </>
          )}

          {activeTab === 'set' && (
            <>
              {/* Select Existing Template */}
              <ZZZSelect 
                label={t('select_set')}
                value={selectedSetId}
                options={[
                    ...DISC_SETS.map(s => ({ label: s.name[lang], value: s.id })),
                    ...customSets.map(s => ({ label: s.name + ' (*)', value: s.id }))
                ]}
                onChange={handleSetSelect}
              />
              <div style={{ height: '12px' }} />
              <ZZZInput label={t('set_name')} value={setName} onChange={e => setSetName(e.target.value)} />
              {renderStatList(t('2pc_effect'), pieces2, setPieces2)}
              {renderStatList(t('4pc_effect'), pieces4, setPieces4)}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <ZZZButton variant="secondary" onClick={onClose}>{t('cancel')}</ZZZButton>
          <ZZZButton onClick={() => {
            if (activeTab === 'agent') handleSaveAgent();
            if (activeTab === 'engine') handleSaveEngine();
            if (activeTab === 'set') handleSaveSet();
          }}>
            {t('save_data')}
          </ZZZButton>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalContentStyle: React.CSSProperties = {
  background: 'var(--zzz-dark-grey)',
  border: '2px solid var(--zzz-yellow)',
  padding: '24px',
  width: '600px',
  maxWidth: '90%',
  color: 'var(--zzz-white)',
  clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
};

const selectStyle: React.CSSProperties = {
  width: '100%', background: 'var(--zzz-black)', color: 'var(--zzz-white)', 
  border: '1px solid var(--zzz-border)', padding: '10px', fontFamily: 'inherit', fontWeight: 'bold', outline: 'none'
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--zzz-black)', color: 'var(--zzz-yellow)', 
  border: '1px solid var(--zzz-border)', padding: '10px', fontWeight: 'bold', fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none'
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'var(--zzz-yellow)', fontSize: '0.85rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 900
};
