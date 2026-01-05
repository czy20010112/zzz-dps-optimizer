import React, { useState, useEffect } from 'react';
import { ZZZCard } from '../ui/ZZZCard';
import { ZZZInput } from '../ui/ZZZInput';
import { ZZZSelect } from '../ui/ZZZSelect';
import { ZZZToggle } from '../ui/ZZZToggle';
import { BaseStats, EnemyStats, AgentData, EngineData, AppMode, TheoreticalConfig } from '../../types';
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
  onEditCustomAgent?: (agent: AgentData) => void; 
  customAgents: AgentData[];
  customEngines: EngineData[];
  budget: number;
  setBudget: (b: number) => void;
  skillMultiplier: number;
  setSkillMultiplier: (val: number) => void;
  theoreticalConfig: TheoreticalConfig;
  setTheoreticalConfig: (c: TheoreticalConfig) => void;
  
  // New Props for Decoupled Selection
  currentSelection: { agent: string, engine: string };
  setSelection: (sel: { agent: string, engine: string }) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  stats, setStats, enemy, setEnemy, mode, setMode,
  onOpenCustomModal, onEditCustomAgent, customAgents, customEngines, budget, setBudget,
  skillMultiplier, setSkillMultiplier,
  theoreticalConfig, setTheoreticalConfig,
  currentSelection, setSelection
}) => {
  const { t, lang } = useLanguage();
  
  const allAgents = [...customAgents, ...AGENTS_DB];
  const allEngines = [...customEngines, ...ENGINES_DB];

  // Helper getters
  const selectedAgent = currentSelection.agent;
  const selectedEngine = currentSelection.engine;

  const agentOptions = [
    { label: t('agent') + '...', value: '' },
    ...allAgents.map(a => ({ label: a.name[lang], value: a.id }))
  ];
  
  const engineOptions = [
    { label: t('w_engine') + '...', value: '' },
    ...allEngines.map(e => ({ label: e.name[lang], value: e.id }))
  ];

  // Handle Edit Click - Now works for ALL agents (View/Edit)
  const handleEditClick = () => {
    if (selectedAgent && onEditCustomAgent) {
      const agent = allAgents.find(a => a.id === selectedAgent);
      if (agent) onEditCustomAgent(agent);
    }
  };

  const handleSelectionChange = (key: 'agent' | 'engine', val: string) => {
    setSelection({ ...currentSelection, [key]: val });
  };

  useEffect(() => {
    // CRITICAL: Block auto-fill in RAW mode.
    // In Raw mode, selection is just for visual reference or future features,
    // it should NOT touch the input values.
    if (mode === 'raw') return;
    
    // Normal Mode Logic: Auto-populate stats
    if (!selectedAgent && !selectedEngine) return;

    const agent = allAgents.find(a => a.id === selectedAgent);
    const engine = allEngines.find(e => e.id === selectedEngine);
    
    const newStats: BaseStats = {
      ...stats,
      atkBase: 0,
      atkPercent: 0,
      critRate: 5,
      critDmg: 50,
      dmgBonus: 0,
      penRatio: 0,
      penFlat: 0,
      defReduction: 0,
      resReduction: 0,
      impact: 100,
      anomalyMastery: 100,
      anomalyProficiency: 100,
    };

    if (agent?.stats) {
       if (agent.stats.atkBase) newStats.atkBase = agent.stats.atkBase;
       if (agent.stats.critRate) newStats.critRate = agent.stats.critRate;
       if (agent.stats.critDmg) newStats.critDmg = agent.stats.critDmg;
       if (agent.stats.impact) newStats.impact = agent.stats.impact;
       if (agent.stats.anomalyMastery) newStats.anomalyMastery = agent.stats.anomalyMastery;
       
       if (agent.stats.atkPercent) newStats.atkPercent += agent.stats.atkPercent;
       if (agent.stats.dmgBonus) newStats.dmgBonus += agent.stats.dmgBonus;
       if (agent.stats.penRatio) newStats.penRatio += agent.stats.penRatio;
       if (agent.stats.defReduction) newStats.defReduction += agent.stats.defReduction;
       if (agent.stats.resReduction) newStats.resReduction += agent.stats.resReduction;
       
       if ((agent.stats as any).extra?.skillMultiplier) {
         setSkillMultiplier((agent.stats as any).extra.skillMultiplier);
       }
    }

    if (engine?.stats) {
       newStats.atkBase += (engine.stats.atkBase || 0);
       if (engine.stats.atkPercent) newStats.atkPercent += engine.stats.atkPercent;
       if (engine.stats.critRate) newStats.critRate += engine.stats.critRate;
       if (engine.stats.critDmg) newStats.critDmg += engine.stats.critDmg;
       if (engine.stats.dmgBonus) newStats.dmgBonus += engine.stats.dmgBonus;
       if (engine.stats.penRatio) newStats.penRatio += engine.stats.penRatio;
       if (engine.stats.impact) newStats.impact += engine.stats.impact;
    }

    setStats(newStats);
  }, [selectedAgent, selectedEngine, mode, customAgents]); // Added dependencies

  const handleStatChange = (key: keyof BaseStats, value: string) => {
    setStats({ ...stats, [key]: parseFloat(value) || 0 });
  };

  const handleRawAtkChange = (value: string) => {
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

  // Main Stat Options for Theoretical Mode - Localized
  const slot4Options = [
    { label: t('stat_critRate'), value: 'critRate' },
    { label: t('stat_critDmg'), value: 'critDmg' },
    { label: t('stat_atk_'), value: 'atk_' },
    { label: t('stat_anomaly'), value: 'anomaly' },
  ];
  const slot5Options = [
    { label: t('stat_elemental'), value: 'elemental' },
    { label: t('stat_pen_'), value: 'pen_' },
    { label: t('stat_atk_'), value: 'atk_' },
  ];
  const slot6Options = [
    { label: t('stat_atk_'), value: 'atk_' },
    { label: t('stat_impact'), value: 'impact' },
    { label: t('stat_mastery'), value: 'mastery' },
    { label: t('stat_energy'), value: 'energy' },
  ];

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
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedAgent && (
                    <button
                      onClick={handleEditClick}
                      style={{
                          background: 'transparent', border: '1px solid var(--zzz-cyan)',
                          color: 'var(--zzz-cyan)', padding: '4px 12px',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                          fontStyle: 'italic'
                      }}
                    >
                      {t('view_edit')} ✎
                    </button>
                  )}
                  <button
                    onClick={onOpenCustomModal}
                    style={{
                        background: 'transparent', border: '1px solid var(--zzz-yellow)',
                        color: 'var(--zzz-yellow)', padding: '4px 12px',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                        fontStyle: 'italic'
                    }}
                  >
                    {t('add_custom')} +
                  </button>
                </div>
            )
        }
      >
        {/* Agent/Engine Selection - In Raw Mode, we still show selection but it doesn't affect inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <ZZZSelect 
                label={t('agent')} 
                options={agentOptions} 
                value={selectedAgent} 
                onChange={(v) => handleSelectionChange('agent', v)} 
            />
            <ZZZSelect 
                label={t('w_engine')} 
                options={engineOptions} 
                value={selectedEngine} 
                onChange={(v) => handleSelectionChange('engine', v)} 
            />
        </div>

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
                
                <ZZZInput label="局内攻击加成 %" type="number" value={stats.atkPercent} onChange={e => handleStatChange('atkPercent', e.target.value)} />
                <ZZZInput label="局内固定攻击" type="number" value={stats.atkFlat} onChange={e => handleStatChange('atkFlat', e.target.value)} />

                <ZZZInput label={t('final_crit_rate')} type="number" value={stats.critRate} onChange={e => handleStatChange('critRate', e.target.value)} style={{ borderColor: 'var(--zzz-red)' }}/>
                <ZZZInput label={t('final_crit_dmg')} type="number" value={stats.critDmg} onChange={e => handleStatChange('critDmg', e.target.value)} style={{ borderColor: 'var(--zzz-red)' }} />
                <ZZZInput label={t('dmg_bonus')} type="number" value={stats.dmgBonus} onChange={e => handleStatChange('dmgBonus', e.target.value)} />
                <ZZZInput label={t('pen_ratio')} type="number" value={stats.penRatio} onChange={e => handleStatChange('penRatio', e.target.value)} />
                <ZZZInput label={t('final_pen')} type="number" value={stats.penFlat} onChange={e => handleStatChange('penFlat', e.target.value)} />
                
                <ZZZInput label="减防/无视防御 %" type="number" value={stats.defReduction || 0} onChange={e => handleStatChange('defReduction', e.target.value)} />
                <ZZZInput label="抗性降低 %" type="number" value={stats.resReduction || 0} onChange={e => handleStatChange('resReduction', e.target.value)} />
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
                <ZZZInput label="减防/无视防御 %" type="number" value={stats.defReduction || 0} onChange={e => handleStatChange('defReduction', e.target.value)} />
                <ZZZInput label="抗性降低 %" type="number" value={stats.resReduction || 0} onChange={e => handleStatChange('resReduction', e.target.value)} />
              </>
          )}
        </div>
        
        {/* Task 4: Theoretical Mode Specific Config */}
        {mode === 'theoretical' && (
           <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--zzz-grey)' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                 <ZZZInput 
                    label={t('substat_budget')}
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                 />
                 <ZZZSelect 
                    label={t('slot_4')}
                    value={theoreticalConfig.slot4} 
                    options={slot4Options} 
                    onChange={v => setTheoreticalConfig({...theoreticalConfig, slot4: v as any})} 
                 />
                 <ZZZSelect 
                    label={t('slot_5')}
                    value={theoreticalConfig.slot5} 
                    options={slot5Options} 
                    onChange={v => setTheoreticalConfig({...theoreticalConfig, slot5: v as any})} 
                 />
                 <ZZZSelect 
                    label={t('slot_6')}
                    value={theoreticalConfig.slot6} 
                    options={slot6Options} 
                    onChange={v => setTheoreticalConfig({...theoreticalConfig, slot6: v as any})} 
                 />
             </div>
           </div>
        )}
      </ZZZCard>

      {/* Target Analysis */}
      <ZZZCard title={t('target_analysis')} borderColor="var(--zzz-red)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ZZZInput label={t('enemy_level')} type="number" value={enemy.level} onChange={e => handleEnemyChange('level', parseInt(e.target.value) || 0)} />
          <ZZZInput label={t('enemy_def')} type="number" value={enemy.def} onChange={e => handleEnemyChange('def', parseInt(e.target.value) || 0)} />
          <ZZZInput label={t('resistance')} type="number" value={enemy.res} onChange={e => handleEnemyChange('res', parseFloat(e.target.value) || 0)} />
          
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