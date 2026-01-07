
import React, { useEffect } from 'react';
import { ZZZCard } from '../ui/ZZZCard';
import { ZZZInput } from '../ui/ZZZInput';
import { ZZZSelect } from '../ui/ZZZSelect';
import { ZZZToggle } from '../ui/ZZZToggle';
import { BaseStats, EnemyStats, AgentData, EngineData, AppMode, TheoreticalConfig } from '../../types';
import { useLanguage } from '../../locales';
import { AGENTS_DB, ENGINES_DB } from '../../data';
import { calculateFinalStats } from '../../utils/statCalculator'; // SSOT Import

interface ConfigPanelProps {
  stats: BaseStats;
  setStats: (s: BaseStats) => void;
  enemy: EnemyStats;
  setEnemy: (e: EnemyStats) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  onOpenCustomModal: (editingData?: { agent?: AgentData, engine?: EngineData }) => void; 
  onEditCustomAgent?: (agent: AgentData) => void; 
  customAgents: AgentData[];
  customEngines: EngineData[];
  budget: number;
  setBudget: (b: number) => void;
  skillMultiplier: number;
  setSkillMultiplier: (val: number) => void;
  theoreticalConfig: TheoreticalConfig;
  setTheoreticalConfig: (c: TheoreticalConfig) => void;
  currentSelection: { agent: string, engine: string };
  setSelection: (sel: { agent: string, engine: string }) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  stats, setStats, enemy, setEnemy, mode, setMode,
  onOpenCustomModal, customAgents, customEngines, budget, setBudget,
  skillMultiplier, setSkillMultiplier,
  theoreticalConfig, setTheoreticalConfig,
  currentSelection, setSelection
}) => {
  const { t, lang } = useLanguage();
  
  const allAgents = [...customAgents, ...AGENTS_DB];
  const allEngines = [...customEngines, ...ENGINES_DB];

  // Helper getters
  const selectedAgentId = currentSelection.agent;
  const selectedEngineId = currentSelection.engine;

  const agentOptions = [
    { label: t('agent') + '...', value: '' },
    ...allAgents.map(a => ({ label: a.name[lang], value: a.id }))
  ];
  
  const engineOptions = [
    { label: t('w_engine') + '...', value: '' },
    ...allEngines.map(e => ({ label: e.name[lang], value: e.id }))
  ];

  const handleEditClick = () => {
    const agent = allAgents.find(a => a.id === selectedAgentId);
    const engine = allEngines.find(e => e.id === selectedEngineId);
    if (agent || engine) {
      onOpenCustomModal({ agent, engine });
    }
  };

  const handleSelectionChange = (key: 'agent' | 'engine', val: string) => {
    setSelection({ ...currentSelection, [key]: val });
  };

  useEffect(() => {
    if (mode === 'raw') return;
    if (!selectedAgentId && !selectedEngineId) return;

    const agent = allAgents.find(a => a.id === selectedAgentId);
    const engine = allEngines.find(e => e.id === selectedEngineId);
    
    // ConfigPanel only shows Agent+Engine base stats. Sets are applied later in optimization.
    // So we pass empty arrays for discs and customSets here.
    const calculated = calculateFinalStats(agent, engine, [], {}, []);

    setStats(calculated);

    if (calculated.skillMultiplier) {
        setSkillMultiplier(calculated.skillMultiplier);
    }

  }, [selectedAgentId, selectedEngineId, mode, customAgents, customEngines]); 

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

      <ZZZCard 
        title={mode === 'raw' ? t('panel_stats') : t('agent_specs')}
        extra={
            mode !== 'raw' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(selectedAgentId || selectedEngineId) && (
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
                    onClick={() => onOpenCustomModal()}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <ZZZSelect 
                label={t('agent')} 
                options={agentOptions} 
                value={selectedAgentId} 
                onChange={(v) => handleSelectionChange('agent', v)} 
            />
            <ZZZSelect 
                label={t('w_engine')} 
                options={engineOptions} 
                value={selectedEngineId} 
                onChange={(v) => handleSelectionChange('engine', v)} 
            />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {mode === 'raw' ? (
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
