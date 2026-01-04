import React, { useState, useEffect } from 'react';
import { ZZZCard } from '../ui/ZZZCard';
import { ZZZInput } from '../ui/ZZZInput';
import { ZZZSelect } from '../ui/ZZZSelect';
import { ZZZToggle } from '../ui/ZZZToggle';
import { BaseStats, EnemyStats, AgentData, EngineData, AppMode } from '../../types';
import { useLanguage } from '../../locales';
import { AGENTS_DB, ENGINES_DB } from '../../data';

interface ConfigPanelProps {
  stats: BaseStats;
  setStats: (s: BaseStats) => void;
  enemy: EnemyStats;
  setEnemy: (e: EnemyStats) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  onOpenCustomModal: () => void;
  customAgents: AgentData[];
  customEngines: EngineData[];
  budget: number;
  setBudget: (b: number) => void;
  // New props for Skill Multiplier
  skillMultiplier: number;
  setSkillMultiplier: (val: number) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  stats, setStats, enemy, setEnemy, mode, setMode,
  onOpenCustomModal, customAgents, customEngines, budget, setBudget,
  skillMultiplier, setSkillMultiplier
}) => {
  const { t, lang } = useLanguage();
  
  // Combine default DB with custom data
  const allAgents = [...customAgents, ...AGENTS_DB];
  const allEngines = [...customEngines, ...ENGINES_DB];

  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  // Generate Options with localized labels
  const agentOptions = [
    { label: t('agent') + '...', value: '' },
    ...allAgents.map(a => ({ label: a.name[lang], value: a.id }))
  ];
  
  const engineOptions = [
    { label: t('w_engine') + '...', value: '' },
    ...allEngines.map(e => ({ label: e.name[lang], value: e.id }))
  ];

  // Auto-fill Logic (Only active in normal modes)
  useEffect(() => {
    // CRITICAL: Prevent side effects if in Raw Mode
    if (mode === 'raw') return;

    if (!selectedAgent && !selectedEngine) return;

    const agent = allAgents.find(a => a.id === selectedAgent);
    const engine = allEngines.find(e => e.id === selectedEngine);

    const newStats = { ...stats };
    let baseAtk = 0;
    
    // Only reset key fields that are derived from Agent/Engine base stats
    if (agent?.stats) {
      baseAtk += agent.stats.atkBase || 0;
      if (agent.stats.critRate !== undefined) newStats.critRate = agent.stats.critRate;
      if (agent.stats.critDmg !== undefined) newStats.critDmg = agent.stats.critDmg;
      if (agent.stats.penRatio !== undefined) newStats.penRatio = agent.stats.penRatio;
      if (agent.stats.defReduction !== undefined) newStats.defReduction = agent.stats.defReduction;
    }
    if (engine?.stats) {
      baseAtk += engine.stats.atkBase || 0;
      if (engine.stats.critRate) newStats.critRate = (newStats.critRate || 5) + engine.stats.critRate;
      if (engine.stats.critDmg) newStats.critDmg = (newStats.critDmg || 50) + engine.stats.critDmg;
      if (engine.stats.atkPercent) newStats.atkPercent = engine.stats.atkPercent;
      if (engine.stats.dmgBonus) newStats.dmgBonus = engine.stats.dmgBonus;
    }

    if (baseAtk > 0) newStats.atkBase = baseAtk;
    setStats(newStats);
  }, [selectedAgent, selectedEngine, mode]);

  const handleStatChange = (key: keyof BaseStats, value: string) => {
    setStats({ ...stats, [key]: parseFloat(value) || 0 });
  };

  const handleRawAtkChange = (value: string) => {
    // Maps "Panel ATK" to atkBase
    setStats({ ...stats, atkBase: parseFloat(value) || 0 });
  };

  const handleEnemyChange = (key: keyof EnemyStats, value: number | boolean) => {
    setEnemy({ ...enemy, [key]: value } as EnemyStats);
  };

  const toggleBtnStyle = (isActive: boolean, clipType: 'left' | 'mid' | 'right') => {
    let clipPath = '';
    if (clipType === 'left') clipPath = 'polygon(0 0, 92% 0, 100% 100%, 0 100%)';
    if (clipType === 'mid') clipPath = 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)';
    if (clipType === 'right') clipPath = 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)';

    return {
        flex: 1, padding: '12px', cursor: 'pointer',
        background: isActive ? 'var(--zzz-yellow)' : 'transparent',
        color: isActive ? 'var(--zzz-black)' : 'var(--zzz-light-grey)',
        fontWeight: 900, textTransform: 'uppercase' as const, fontStyle: 'italic',
        border: isActive ? '1px solid var(--zzz-yellow)' : '1px solid var(--zzz-border)',
        clipPath,
        marginLeft: clipType === 'left' ? 0 : '-15px',
        position: 'relative' as const,
        zIndex: isActive ? 10 : 1,
        transition: 'all 0.2s',
        fontSize: '0.8rem'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 3-Mode Switcher */}
      <div style={{ display: 'flex', gap: '0', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
        <button 
          onClick={() => setMode('inventory')}
          style={toggleBtnStyle(mode === 'inventory', 'left')}
        >
          {t('mode_inventory')}
        </button>
        <button 
          onClick={() => setMode('theoretical')}
          style={toggleBtnStyle(mode === 'theoretical', 'mid')}
        >
          {t('mode_theoretical')}
        </button>
        <button 
          onClick={() => setMode('raw')}
          style={toggleBtnStyle(mode === 'raw', 'right')}
        >
          {t('mode_raw')}
        </button>
      </div>

      {/* Stats Card */}
      <ZZZCard 
        title={mode === 'raw' ? t('panel_stats') : t('agent_specs')}
        extra={
            mode !== 'raw' && (
                <button
                onClick={onOpenCustomModal}
                style={{
                    background: 'transparent', border: '1px solid var(--zzz-yellow)',
                    color: 'var(--zzz-yellow)', padding: '4px 12px',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                    fontStyle: 'italic'
                }}
                >
                {t('add_custom')} ⚙
                </button>
            )
        }
      >
        {/* Agent/Engine Selection - Hidden in Raw Mode */}
        {mode !== 'raw' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <ZZZSelect label={t('agent')} options={agentOptions} value={selectedAgent} onChange={setSelectedAgent} />
            <ZZZSelect label={t('w_engine')} options={engineOptions} value={selectedEngine} onChange={setSelectedEngine} />
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Conditional Inputs based on Mode */}
          {mode === 'raw' ? (
              // RAW MODE INPUTS
              <>
                <ZZZInput 
                    label={t('final_atk')} 
                    type="number" 
                    value={stats.atkBase} 
                    onChange={e => handleRawAtkChange(e.target.value)} 
                    style={{ borderColor: 'var(--zzz-yellow)' }} 
                />
                <ZZZInput 
                    label="技能倍率 % (Skill MV)" 
                    type="number" 
                    value={skillMultiplier} 
                    onChange={e => setSkillMultiplier(parseFloat(e.target.value) || 0)} 
                    style={{ borderColor: 'var(--zzz-cyan)' }}
                />
                
                {/* New In-Battle Buffs */}
                <ZZZInput 
                    label="局内攻击加成 % (In-Battle ATK%)" 
                    type="number" 
                    value={stats.atkPercent} 
                    onChange={e => handleStatChange('atkPercent', e.target.value)} 
                />
                <ZZZInput 
                    label="局内固定攻击 (In-Battle Flat ATK)" 
                    type="number" 
                    value={stats.atkFlat} 
                    onChange={e => handleStatChange('atkFlat', e.target.value)} 
                />

                <ZZZInput label={t('final_crit_rate')} type="number" value={stats.critRate} onChange={e => handleStatChange('critRate', e.target.value)} style={{ borderColor: 'var(--zzz-red)' }}/>
                <ZZZInput label={t('final_crit_dmg')} type="number" value={stats.critDmg} onChange={e => handleStatChange('critDmg', e.target.value)} style={{ borderColor: 'var(--zzz-red)' }} />
                <ZZZInput label={t('dmg_bonus')} type="number" value={stats.dmgBonus} onChange={e => handleStatChange('dmgBonus', e.target.value)} />
                <ZZZInput label={t('pen_ratio')} type="number" value={stats.penRatio} onChange={e => handleStatChange('penRatio', e.target.value)} />
                <ZZZInput label={t('final_pen')} type="number" value={stats.penFlat} onChange={e => handleStatChange('penFlat', e.target.value)} />
                {/* New Def Reduction Field */}
                <ZZZInput 
                  label="减防/无视防御 % (Def Shred)" 
                  type="number" 
                  value={stats.defReduction || 0} 
                  onChange={e => handleStatChange('defReduction', e.target.value)} 
                />
              </>
          ) : (
              // NORMAL MODE INPUTS
              <>
                <ZZZInput label={t('base_atk')} type="number" value={stats.atkBase} onChange={e => handleStatChange('atkBase', e.target.value)} />
                <ZZZInput label={t('flat_atk')} type="number" value={stats.atkFlat} onChange={e => handleStatChange('atkFlat', e.target.value)} />
                <ZZZInput label={t('atk_percent')} type="number" value={stats.atkPercent} onChange={e => handleStatChange('atkPercent', e.target.value)} />
                <ZZZInput label={t('dmg_bonus')} type="number" value={stats.dmgBonus} onChange={e => handleStatChange('dmgBonus', e.target.value)} />
                <ZZZInput label={t('crit_rate')} type="number" value={stats.critRate} onChange={e => handleStatChange('critRate', e.target.value)} style={{ borderColor: 'var(--zzz-red)' }}/>
                <ZZZInput label={t('crit_dmg')} type="number" value={stats.critDmg} onChange={e => handleStatChange('critDmg', e.target.value)} style={{ borderColor: 'var(--zzz-red)' }} />
                <ZZZInput label={t('pen_flat')} type="number" value={stats.penFlat} onChange={e => handleStatChange('penFlat', e.target.value)} />
                <ZZZInput label={t('pen_ratio')} type="number" value={stats.penRatio} onChange={e => handleStatChange('penRatio', e.target.value)} />
              </>
          )}
        </div>
        
        {mode === 'theoretical' && (
           <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--zzz-grey)' }}>
             <ZZZInput 
                label={t('substat_budget')}
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
             />
           </div>
        )}
      </ZZZCard>

      {/* Target Analysis */}
      <ZZZCard title={t('target_analysis')} borderColor="var(--zzz-red)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ZZZInput label={t('enemy_level')} type="number" value={enemy.level} onChange={e => handleEnemyChange('level', parseInt(e.target.value) || 0)} />
          <ZZZInput label={t('enemy_def')} type="number" value={enemy.def} onChange={e => handleEnemyChange('def', parseInt(e.target.value) || 0)} />
          <ZZZInput label={t('resistance')} type="number" value={enemy.res} onChange={e => handleEnemyChange('res', parseFloat(e.target.value) || 0)} />
          
          {/* Aligned Stun Input with Toggle in Label */}
          <ZZZInput 
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('stun_mult')}</span>
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                  <ZZZToggle label={t('target_stunned')} checked={enemy.stunned} onChange={val => handleEnemyChange('stunned', val)} />
                </div>
              </div>
            }
            type="number"
            value={enemy.stunMultiplier}
            onChange={e => handleEnemyChange('stunMultiplier', parseFloat(e.target.value) || 0)}
          />
        </div>
      </ZZZCard>
    </div>
  );
};