
import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { ConfigPanel } from './components/Features/ConfigPanel';
import { InventoryManager } from './components/Features/InventoryManager';
import { ResultDashboard } from './components/Features/ResultDashboard';
import { CustomDataModal } from './components/modals/CustomDataModal';
import { IntroModal } from './components/modals/IntroModal';
import { ZZZButton } from './components/ui/ZZZButton';
import { BaseStats, EnemyStats, DiscItem, OptimizationResult, AgentData, EngineData, CustomSetData, AppMode, TheoreticalConfig } from './types';
import { optimizerService } from './services/optimizer.service';
import { useLanguage } from './locales';

const initialStats: BaseStats = {
  atkBase: 800,
  atkFlat: 0,
  atkPercent: 0,
  critRate: 5,
  critDmg: 50,
  penFlat: 0,
  penRatio: 0,
  defReduction: 0, 
  resReduction: 0,
  dmgBonus: 0,
  def: 600,
  hp: 10000,
  impact: 100,
  anomalyMastery: 100,
  anomalyProficiency: 100,
  energy: 100
};

const initialEnemy: EnemyStats = {
  def: 800,
  res: 0,
  stunned: false,
  stunMultiplier: 150,
  level: 50
};

const initialTheoreticalConfig: TheoreticalConfig = {
  slot4: 'critDmg',
  slot5: 'elemental',
  slot6: 'atk_'
};

export const CalculatorPage: React.FC = () => {
  const { t } = useLanguage();
  
  const [mode, setMode] = useState<AppMode>('inventory');
  const [showIntro, setShowIntro] = useState(false);
  
  // Check LocalStorage for Intro
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenIntro');
    if (!hasSeen) {
      setShowIntro(true);
    }
  }, []);

  const handleCloseIntro = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };
  
  // --- STATE ISOLATION ---
  
  // 1. STATS Isolation
  const [inventoryStats, setInventoryStats] = useState<BaseStats>(initialStats);
  const [theoreticalStats, setTheoreticalStats] = useState<BaseStats>(initialStats);
  const [rawStats, setRawStats] = useState<BaseStats>({ ...initialStats });

  // 2. ENEMY Isolation
  const [inventoryEnemy, setInventoryEnemy] = useState<EnemyStats>({ ...initialEnemy });
  const [theoreticalEnemy, setTheoreticalEnemy] = useState<EnemyStats>({ ...initialEnemy });
  const [rawEnemy, setRawEnemy] = useState<EnemyStats>({ ...initialEnemy });

  // 3. SELECTION Isolation
  const [inventorySelection, setInventorySelection] = useState<{agent: string, engine: string}>({ agent: '', engine: '' });
  const [theoreticalSelection, setTheoreticalSelection] = useState<{agent: string, engine: string}>({ agent: '', engine: '' });
  const [rawSelection, setRawSelection] = useState<{agent: string, engine: string}>({ agent: '', engine: '' });

  // Common State
  const [inventory, setInventory] = useState<DiscItem[]>([]);
  const [budget, setBudget] = useState(45); 
  const [skillMultiplier, setSkillMultiplier] = useState(2500); 
  const [theoreticalConfig, setTheoreticalConfig] = useState<TheoreticalConfig>(initialTheoreticalConfig);

  // Custom Data Management
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAgents, setCustomAgents] = useState<AgentData[]>([]);
  const [customEngines, setCustomEngines] = useState<EngineData[]>([]);
  const [customSets, setCustomSets] = useState<CustomSetData[]>([]); 
  const [editingData, setEditingData] = useState<{agent?: AgentData, engine?: EngineData} | undefined>(undefined);

  // Results
  const [theoreticalResult, setTheoreticalResult] = useState<OptimizationResult | null>(null);
  const [inventoryResult, setInventoryResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- Helpers to Get/Set Active State ---
  const activeStats = mode === 'inventory' ? inventoryStats : (mode === 'theoretical' ? theoreticalStats : rawStats);
  const setActiveStats = (s: BaseStats) => {
    if (mode === 'inventory') setInventoryStats(s);
    else if (mode === 'theoretical') setTheoreticalStats(s);
    else setRawStats(s);
  };

  const activeEnemy = mode === 'inventory' ? inventoryEnemy : (mode === 'theoretical' ? theoreticalEnemy : rawEnemy);
  const setActiveEnemy = (e: EnemyStats) => {
    if (mode === 'inventory') setInventoryEnemy(e);
    else if (mode === 'theoretical') setTheoreticalEnemy(e);
    else setRawEnemy(e);
  };

  const activeSelection = mode === 'inventory' ? inventorySelection : (mode === 'theoretical' ? theoreticalSelection : rawSelection);
  const setActiveSelection = (sel: {agent: string, engine: string}) => {
    if (mode === 'inventory') setInventorySelection(sel);
    else if (mode === 'theoretical') setTheoreticalSelection(sel);
    else setRawSelection(sel);
  };

  // Handler for opening the modal (New / Edit)
  const handleOpenModal = (data?: { agent?: AgentData, engine?: EngineData }) => {
    setEditingData(data);
    setShowCustomModal(true);
  };

  const handleSaveAgent = (updatedAgent: AgentData) => {
    const idx = customAgents.findIndex(a => a.id === updatedAgent.id);
    if (idx >= 0) {
      const newAgents = [...customAgents];
      newAgents[idx] = updatedAgent;
      setCustomAgents(newAgents);
    } else {
      setCustomAgents([...customAgents, updatedAgent]);
    }
    if (mode !== 'raw') {
        setActiveSelection({ ...activeSelection, agent: updatedAgent.id });
    }
  };

  const handleSaveEngine = (updatedEngine: EngineData) => {
    const idx = customEngines.findIndex(e => e.id === updatedEngine.id);
    if (idx >= 0) {
      const newEngines = [...customEngines];
      newEngines[idx] = updatedEngine;
      setCustomEngines(newEngines);
    } else {
      setCustomEngines([...customEngines, updatedEngine]);
    }
    if (mode !== 'raw') {
        setActiveSelection({ ...activeSelection, engine: updatedEngine.id });
    }
  };

  const handleSaveSet = (updatedSet: CustomSetData) => {
    const idx = customSets.findIndex(s => s.id === updatedSet.id);
    if (idx >= 0) {
        const newSets = [...customSets];
        newSets[idx] = updatedSet;
        setCustomSets(newSets);
    } else {
        setCustomSets([...customSets, updatedSet]);
    }
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      if (mode === 'theoretical') {
        setInventoryResult(null); 
        setTheoreticalResult(null);
        
        const requestStats = { ...theoreticalStats, skillMultiplier };
        const tResult = await optimizerService.calculateTheoretical(requestStats, theoreticalEnemy, budget, theoreticalConfig); 
        setTheoreticalResult(tResult);

      } else if (mode === 'raw') {
        setInventoryResult(null);
        setTheoreticalResult(null);

        const cleanRawStats: BaseStats = {
            ...initialStats, 
            atkBase: rawStats.atkBase,      
            atkPercent: rawStats.atkPercent,
            atkFlat: rawStats.atkFlat,      
            critRate: rawStats.critRate,
            critDmg: rawStats.critDmg,
            dmgBonus: rawStats.dmgBonus,
            penFlat: rawStats.penFlat,
            penRatio: rawStats.penRatio,
            defReduction: rawStats.defReduction, 
            resReduction: rawStats.resReduction, 
            def: rawStats.def, 
            skillMultiplier: skillMultiplier 
        };

        // Task 1: Explicitly tell worker this is RAW mode via config
        const tResult = await optimizerService.calculateTheoretical(cleanRawStats, rawEnemy, 0, { ...theoreticalConfig, isRaw: true }); 
        tResult.description = `倍率 (MV: ${skillMultiplier}%)`;
        setTheoreticalResult(tResult);

      } else {
        // Inventory Mode
        setTheoreticalResult(null);
        setInventoryResult(null);

        if (inventory.length > 0) {
          const requestStats = { ...inventoryStats, skillMultiplier };
          const iResult = await optimizerService.optimizeInventory(requestStats, inventoryEnemy, inventory);
          setInventoryResult(iResult);
        }
      }
    } catch (error) {
      console.error("Calculation failed:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 300px',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ConfigPanel 
            stats={activeStats} 
            setStats={setActiveStats} 
            enemy={activeEnemy} 
            setEnemy={setActiveEnemy}
            mode={mode}
            setMode={setMode}
            onOpenCustomModal={handleOpenModal}
            customAgents={customAgents}
            customEngines={customEngines}
            budget={budget}
            setBudget={setBudget}
            skillMultiplier={skillMultiplier}
            setSkillMultiplier={setSkillMultiplier}
            theoreticalConfig={theoreticalConfig}
            setTheoreticalConfig={setTheoreticalConfig}
            currentSelection={activeSelection}
            setSelection={setActiveSelection}
          />
          
          {mode === 'inventory' && (
            <InventoryManager 
              inventory={inventory} 
              setInventory={setInventory}
              customSets={customSets}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '20px' }}>
            <ZZZButton 
                onClick={handleCalculate} 
                disabled={isCalculating}
                block
                style={{ height: '60px', fontSize: '1.2rem' }}
            >
                {isCalculating ? t('processing') : t('initiate_sim')}
            </ZZZButton>
            
            <ResultDashboard 
                theoretical={theoreticalResult} 
                inventoryResult={inventoryResult} 
                isCalculating={isCalculating}
                enemy={activeEnemy} 
            />
        </div>

      </div>

      {showCustomModal && (
        <CustomDataModal 
           onClose={() => setShowCustomModal(false)}
           onSaveAgent={handleSaveAgent}
           onSaveEngine={handleSaveEngine}
           onSaveSet={handleSaveSet}
           initialData={editingData} 
           customSets={customSets}
        />
      )}

      {showIntro && (
        <IntroModal onClose={handleCloseIntro} />
      )}

    </MainLayout>
  );
};
