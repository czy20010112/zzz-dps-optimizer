import React, { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { ConfigPanel } from './components/Features/ConfigPanel';
import { InventoryManager } from './components/Features/InventoryManager';
import { ResultDashboard } from './components/Features/ResultDashboard';
import { CustomDataModal } from './components/modals/CustomDataModal';
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
  resReduction: 0, // Initialize
  dmgBonus: 0,
  def: 600,
  hp: 10000,
  impact: 100,
  anomalyMastery: 100,
  anomalyProficiency: 100
};

const initialEnemy: EnemyStats = {
  def: 800,
  res: 0,
  stunned: false,
  stunMultiplier: 150,
  level: 50
};

// Task 4: Default Theoretical Config
const initialTheoreticalConfig: TheoreticalConfig = {
  slot4: 'critDmg',
  slot5: 'elemental',
  slot6: 'atk_'
};

export const CalculatorPage: React.FC = () => {
  const { t } = useLanguage();
  
  // --- STATE ISOLATION ---
  const [scenarioStats, setScenarioStats] = useState<BaseStats>(initialStats);
  const [rawStats, setRawStats] = useState<BaseStats>({ ...initialStats });
  const [enemy, setEnemy] = useState<EnemyStats>(initialEnemy);
  const [inventory, setInventory] = useState<DiscItem[]>([]);
  
  const [mode, setMode] = useState<AppMode>('inventory');
  const [budget, setBudget] = useState(45); 
  const [skillMultiplier, setSkillMultiplier] = useState(2500); 

  // Task 4: Selection State Decoupling
  const [scenarioSelection, setScenarioSelection] = useState<{agent: string, engine: string}>({ agent: '', engine: '' });
  const [rawSelection, setRawSelection] = useState<{agent: string, engine: string}>({ agent: '', engine: '' });

  // Task 4 State
  const [theoreticalConfig, setTheoreticalConfig] = useState<TheoreticalConfig>(initialTheoreticalConfig);

  // Custom Data Management
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAgents, setCustomAgents] = useState<AgentData[]>([]);
  const [customEngines, setCustomEngines] = useState<EngineData[]>([]);
  const [customSets, setCustomSets] = useState<CustomSetData[]>([]);
  // Task 3: Edit State
  const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);

  const [theoreticalResult, setTheoreticalResult] = useState<OptimizationResult | null>(null);
  const [inventoryResult, setInventoryResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const activeStats = mode === 'raw' ? rawStats : scenarioStats;
  
  const setActiveStats = (newStats: BaseStats) => {
    if (mode === 'raw') {
      setRawStats(newStats);
    } else {
      setScenarioStats(newStats);
    }
  };

  const handleEditAgent = (agent: AgentData) => {
    setEditingAgent(agent);
    setShowCustomModal(true);
  };

  const handleSaveAgent = (updatedAgent: AgentData) => {
    // Check if updating existing
    const idx = customAgents.findIndex(a => a.id === updatedAgent.id);
    if (idx >= 0) {
      const newAgents = [...customAgents];
      newAgents[idx] = updatedAgent;
      setCustomAgents(newAgents);
    } else {
      setCustomAgents([...customAgents, updatedAgent]);
    }
    setEditingAgent(null); // Clear edit state
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      if (mode === 'theoretical') {
        setInventoryResult(null); 
        setTheoreticalResult(null);
        
        const requestStats = { ...scenarioStats, skillMultiplier };
        // Task 4: Pass theoreticalConfig
        const tResult = await optimizerService.calculateTheoretical(requestStats, enemy, budget, theoreticalConfig); 
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

        const tResult = await optimizerService.calculateTheoretical(cleanRawStats, enemy, 0); 
        tResult.description = `Direct Calculation // 直伤 (MV: ${skillMultiplier}%)`;
        setTheoreticalResult(tResult);

      } else {
        // Inventory Mode
        setTheoreticalResult(null);
        setInventoryResult(null);

        if (inventory.length > 0) {
          const requestStats = { ...scenarioStats, skillMultiplier };
          const iResult = await optimizerService.optimizeInventory(requestStats, enemy, inventory);
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
            enemy={enemy} 
            setEnemy={setEnemy}
            mode={mode}
            setMode={setMode}
            onOpenCustomModal={() => { setEditingAgent(null); setShowCustomModal(true); }}
            onEditCustomAgent={handleEditAgent}
            customAgents={customAgents}
            customEngines={customEngines}
            budget={budget}
            setBudget={setBudget}
            skillMultiplier={skillMultiplier}
            setSkillMultiplier={setSkillMultiplier}
            theoreticalConfig={theoreticalConfig}
            setTheoreticalConfig={setTheoreticalConfig}
            // New Selection Props
            currentSelection={mode === 'raw' ? rawSelection : scenarioSelection}
            setSelection={mode === 'raw' ? setRawSelection : setScenarioSelection}
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
                {isCalculating ? 'PROCESSING...' : t('initiate_sim')}
            </ZZZButton>
            
            <ResultDashboard 
                theoretical={theoreticalResult} 
                inventoryResult={inventoryResult} 
                isCalculating={isCalculating}
                enemy={enemy} 
            />
        </div>

      </div>

      {showCustomModal && (
        <CustomDataModal 
           onClose={() => setShowCustomModal(false)}
           onSaveAgent={handleSaveAgent}
           onSaveEngine={(e) => setCustomEngines([...customEngines, e])}
           onSaveSet={(s) => setCustomSets([...customSets, s])}
           initialData={editingAgent} // Pass data for editing
        />
      )}

    </MainLayout>
  );
};