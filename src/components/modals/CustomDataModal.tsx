import React, { useState, useEffect } from 'react';
import { ZZZButton } from '../ui/ZZZButton';
import { ZZZInput } from '../ui/ZZZInput';
import { AgentData, EngineData, CustomSetData, StatType } from '../../types';
import { useLanguage } from '../../locales';

interface CustomDataModalProps {
  onClose: () => void;
  onSaveAgent: (agent: AgentData) => void;
  onSaveEngine: (engine: EngineData) => void;
  onSaveSet: (set: CustomSetData) => void;
  // Support editing
  initialData?: AgentData | null; 
}

const STAT_OPTIONS = [
  { label: 'ATK % (攻击力百分比)', value: 'atk_' },
  { label: 'CRIT Rate (暴击率)', value: 'critRate' },
  { label: 'CRIT DMG (暴击伤害)', value: 'critDmg' },
  { label: 'PEN Ratio (穿透率)', value: 'pen_' },
  { label: 'DMG Bonus (伤害加成)', value: 'elemental' },
  { label: 'Flat ATK (固定攻击)', value: 'atk' },
  { label: 'Impact (冲击力)', value: 'impact' },
  { label: 'Mastery (异常精通)', value: 'mastery' },
  { label: 'Res Shred (抗性降低)', value: 'resReduction' },
  { label: 'Def Shred (防御降低)', value: 'defReduction' },
];

export const CustomDataModal: React.FC<CustomDataModalProps> = ({ onClose, onSaveAgent, onSaveEngine, onSaveSet, initialData }) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'agent' | 'engine' | 'set'>('agent');
  
  const txt = (en: string, cn: string) => (lang === 'cn' ? cn : en);

  // -- Agent State --
  const [agentName, setAgentName] = useState('');
  const [agentBase, setAgentBase] = useState({ atk: 800, critRate: 5, critDmg: 50 });
  const [skillMultiplier, setSkillMultiplier] = useState(1000);
  const [agentBuffs, setAgentBuffs] = useState<{stat: StatType, value: string}[]>([]);
  const [isCopyMode, setIsCopyMode] = useState(false);

  // -- Engine State --
  const [engineName, setEngineName] = useState('');
  const [engineBaseAtk, setEngineBaseAtk] = useState(600);
  const [engineBuffs, setEngineBuffs] = useState<{stat: StatType, value: string}[]>([]);

  // -- Set State --
  const [setName, setSetName] = useState('');
  const [pieces2, setPieces2] = useState<{stat: StatType, value: string}[]>([{ stat: 'atk_', value: '10' }]);
  const [pieces4, setPieces4] = useState<{stat: StatType, value: string}[]>([{ stat: 'critRate', value: '8' }]);

  // -- Initialization for Edit/View Mode --
  useEffect(() => {
    if (initialData) {
      setActiveTab('agent');
      
      // Determine if this is a system preset (Copy Mode) or custom (Edit Mode)
      const isCustom = initialData.id.startsWith('custom_');
      setIsCopyMode(!isCustom);

      // Setup Name
      let rawName = lang === 'cn' ? initialData.name.cn : initialData.name.en;
      if (isCustom) {
         rawName = rawName.replace(' (Custom)', '').replace(' (自定义)', '');
      }
      setAgentName(rawName);
      
      const s = initialData.stats;
      setAgentBase({
        atk: s.atkBase || 0,
        critRate: s.critRate || 5,
        critDmg: s.critDmg || 50
      });

      if ((s as any).extra?.skillMultiplier) {
        setSkillMultiplier((s as any).extra.skillMultiplier);
      }

      // Reverse map stats to buffs array
      const buffs: {stat: StatType, value: string}[] = [];
      if (s.atkPercent) buffs.push({ stat: 'atk_', value: s.atkPercent.toString() });
      if (s.dmgBonus) buffs.push({ stat: 'elemental', value: s.dmgBonus.toString() });
      if (s.penRatio) buffs.push({ stat: 'pen_', value: s.penRatio.toString() });
      if (s.penFlat) buffs.push({ stat: 'pen', value: s.penFlat.toString() });
      if (s.resReduction) buffs.push({ stat: 'resReduction' as any, value: s.resReduction.toString() });
      if (s.defReduction) buffs.push({ stat: 'defReduction' as any, value: s.defReduction.toString() });
      if (s.impact && s.impact > 0) buffs.push({ stat: 'impact', value: s.impact.toString() }); 
      if (s.anomalyMastery && s.anomalyMastery > 0) buffs.push({ stat: 'mastery', value: s.anomalyMastery.toString() });
      
      // IMPORTANT: If Custom Agent has EXTRA crit/critDmg baked into stats, we need to extract it
      // But for simplicity, we assume base is fixed and rest is buffs.
      // However, to fix the issue described, we ensure saving adds them correctly.
      
      setAgentBuffs(buffs);
    } else {
        setIsCopyMode(false);
    }
  }, [initialData, lang]);


  // Helpers
  const addBuff = (setter: any, list: any[]) => setter([...list, { stat: 'atk_', value: '' }]);
  const updateBuff = (setter: any, list: any[], idx: number, key: string, val: string) => {
    const n = [...list];
    (n[idx] as any)[key] = val;
    setter(n);
  };
  const removeBuff = (setter: any, list: any[], idx: number) => setter(list.filter((_, i) => i !== idx));

  const handleSaveAgent = () => {
    const stats: any = { 
      atkBase: agentBase.atk, 
      critRate: agentBase.critRate, 
      critDmg: agentBase.critDmg,
    };
    
    // Sum up all buffs - FIXED LOGIC to include Crit/CritDmg
    agentBuffs.forEach(b => {
      if(b.value) {
        const val = parseFloat(b.value);
        if (b.stat === 'atk_') stats.atkPercent = (stats.atkPercent || 0) + val;
        else if (b.stat === 'elemental') stats.dmgBonus = (stats.dmgBonus || 0) + val;
        else if (b.stat === 'critRate') stats.critRate = (stats.critRate || 0) + val; // ADDED
        else if (b.stat === 'critDmg') stats.critDmg = (stats.critDmg || 0) + val; // ADDED
        else if (b.stat === 'pen_') stats.penRatio = (stats.penRatio || 0) + val;
        else if (b.stat === 'pen') stats.penFlat = (stats.penFlat || 0) + val;
        else if (b.stat === 'atk') stats.atkFlat = (stats.atkFlat || 0) + val; // ADDED
        else if (b.stat === 'resReduction' as any) stats.resReduction = (stats.resReduction || 0) + val;
        else if (b.stat === 'defReduction' as any) stats.defReduction = (stats.defReduction || 0) + val;
        else if (b.stat === 'impact') stats.impact = (stats.impact || 0) + val;
        else if (b.stat === 'mastery') stats.anomalyMastery = (stats.anomalyMastery || 0) + val;
      }
    });

    // ID Logic: If copying from system or new, generate ID. If editing custom, keep ID.
    const newId = (initialData && !isCopyMode) ? initialData.id : `custom_a_${Date.now()}`;

    onSaveAgent({
      id: newId, 
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
        else if (b.stat === 'impact') stats.impact = (stats.impact || 0) + val;
      }
    });

    onSaveEngine({
      id: `custom_e_${Date.now()}`,
      name: { en: `${engineName} (Custom)`, cn: `${engineName} (自定义)` },
      stats
    });
    onClose();
  };

  const handleSaveSet = () => {
    onSaveSet({
      id: `custom_s_${Date.now()}`,
      name: setName,
      pieces2: pieces2.map(p => ({ stat: p.stat, value: parseFloat(p.value) || 0 })),
      pieces4: pieces4.map(p => ({ stat: p.stat, value: parseFloat(p.value) || 0 }))
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
          + {txt('ADD STAT', '添加属性')}
        </button>
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
        {items.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 30px', gap: '8px', marginBottom: '8px' }}>
            <select 
              style={selectStyle} 
              value={b.stat} 
              onChange={e => updateBuff(setter, items, i, 'stat', e.target.value)}
            >
              {STAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
        
        {/* Header Title Update based on Mode */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', borderBottom: '2px solid var(--zzz-border)' }}>
            <div style={{ display: 'flex', width: '100%' }}>
            {[
                { key: 'agent', label: txt('AGENT', '代理人') },
                { key: 'engine', label: txt('W-ENGINE', '音擎') },
                { key: 'set', label: txt('DISC SET', '驱动盘套装') }
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
        {isCopyMode && activeTab === 'agent' && (
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', color: 'var(--zzz-cyan)', 
                padding: '8px', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center' 
            }}>
                {txt('TEMPLATE MODE: Saving will create a new Custom Agent.', '模板模式：保存将创建新的自定义代理人。')}
            </div>
        )}

        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
          {activeTab === 'agent' && (
            <>
              <ZZZInput label={txt('Name', '名称')} value={agentName} onChange={e => setAgentName(e.target.value)} placeholder={txt('e.g. Miyabi', '例如：雅')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ZZZInput label={txt('Base ATK', '基础攻击力')} type="number" value={agentBase.atk} onChange={e => setAgentBase({...agentBase, atk: parseFloat(e.target.value)})} />
                <ZZZInput label={txt('Skill Mult %', '技能倍率 (%)')} type="number" value={skillMultiplier} onChange={e => setSkillMultiplier(parseFloat(e.target.value))} style={{ borderColor: 'var(--zzz-cyan)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ZZZInput label={txt('Base Crit Rate', '基础暴击率 (%)')} type="number" value={agentBase.critRate} onChange={e => setAgentBase({...agentBase, critRate: parseFloat(e.target.value)})} />
                <ZZZInput label={txt('Base Crit Dmg', '基础暴击伤害 (%)')} type="number" value={agentBase.critDmg} onChange={e => setAgentBase({...agentBase, critDmg: parseFloat(e.target.value)})} />
              </div>
              {renderStatList(txt('Passives / Cons (Buffs)', '被动 / 命座 (增益)'), agentBuffs, setAgentBuffs)}
            </>
          )}

          {activeTab === 'engine' && (
            <>
              <ZZZInput label={txt('Name', '名称')} value={engineName} onChange={e => setEngineName(e.target.value)} />
              <ZZZInput label={txt('Base ATK', '基础攻击力')} type="number" value={engineBaseAtk} onChange={e => setEngineBaseAtk(parseFloat(e.target.value))} />
              {renderStatList(txt('Substats / Passives', '副属性 / 特效'), engineBuffs, setEngineBuffs)}
            </>
          )}

          {activeTab === 'set' && (
            <>
              <ZZZInput label={txt('Set Name', '套装名称')} value={setName} onChange={e => setSetName(e.target.value)} placeholder={txt('e.g. Polar Metal', '例如：极地重金属')} />
              {renderStatList(txt('2-Piece Effect', '2件套效果'), pieces2, setPieces2)}
              {renderStatList(txt('4-Piece Effect', '4件套效果'), pieces4, setPieces4)}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <ZZZButton variant="secondary" onClick={onClose}>{txt('CANCEL', '取消')}</ZZZButton>
          <ZZZButton onClick={() => {
            if (activeTab === 'agent') handleSaveAgent();
            if (activeTab === 'engine') handleSaveEngine();
            if (activeTab === 'set') handleSaveSet();
          }}>
            {isCopyMode ? txt('SAVE AS COPY', '另存为副本') : txt('SAVE DATA', '保存数据')}
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