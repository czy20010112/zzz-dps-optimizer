import React, { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { ConfigPanel } from './components/Features/ConfigPanel';
import { InventoryManager } from './components/Features/InventoryManager';
import { ResultDashboard } from './components/Features/ResultDashboard';
import { CustomDataModal } from './components/modals/CustomDataModal';
import { ZZZButton } from './components/ui/ZZZButton';
import { BaseStats, EnemyStats, DiscItem, OptimizationResult, AgentData, EngineData, CustomSetData, AppMode } from './types';
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
  defReduction: 0, // Initialize
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

export const CalculatorPage: React.FC = () => {
  const { t } = useLanguage();
  
  // --- STATE ISOLATION ---
  // State 1: Scenario Stats (For Theoretical & Inventory modes - based on Agent/Engine)
  const [scenarioStats, setScenarioStats] = useState<BaseStats>(initialStats);
  
  // State 2: Raw Stats (For Raw Mode - based on Manual Input)
  const [rawStats, setRawStats] = useState<BaseStats>({ ...initialStats });

  const [enemy, setEnemy] = useState<EnemyStats>(initialEnemy);
  const [inventory, setInventory] = useState<DiscItem[]>([]);
  
  const [mode, setMode] = useState<AppMode>('inventory');
  const [budget, setBudget] = useState(45); // Default budget
  const [skillMultiplier, setSkillMultiplier] = useState(2500); // Default 2500%

  // Custom Data Management
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAgents, setCustomAgents] = useState<AgentData[]>([]);
  const [customEngines, setCustomEngines] = useState<EngineData[]>([]);
  const [customSets, setCustomSets] = useState<CustomSetData[]>([]);

  const [theoreticalResult, setTheoreticalResult] = useState<OptimizationResult | null>(null);
  const [inventoryResult, setInventoryResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Helper to get active stats based on mode
  const activeStats = mode === 'raw' ? rawStats : scenarioStats;
  const setActiveStats = (newStats: BaseStats) => {
    if (mode === 'raw') {
      setRawStats(newStats);
    } else {
      setScenarioStats(newStats);
    }
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      if (mode === 'theoretical') {
        // CRITICAL FIX: Explicitly clear inventory result to prevent display priority conflict
        setInventoryResult(null); 
        setTheoreticalResult(null);
        
        // Inject skill multiplier to scenario stats
        const requestStats = { ...scenarioStats, skillMultiplier };
        const tResult = await optimizerService.calculateTheoretical(requestStats, enemy, budget); 
        setTheoreticalResult(tResult);

      } else if (mode === 'raw') {
        // CRITICAL FIX: Explicitly clear inventory result to prevent display priority conflict
        setInventoryResult(null);
        setTheoreticalResult(null);

        // RAW MODE DATA CLEANING (Fix 1+111% Bug)
        // We use rawStats directly as the source of truth
        const cleanRawStats: BaseStats = {
            ...initialStats, // Reset everything to 0/default first
            atkBase: rawStats.atkBase,      // Mapped from "Panel ATK"
            atkPercent: rawStats.atkPercent,// Mapped from "In-battle ATK%"
            atkFlat: rawStats.atkFlat,      // Mapped from "In-battle Flat"
            critRate: rawStats.critRate,
            critDmg: rawStats.critDmg,
            dmgBonus: rawStats.dmgBonus,
            penFlat: rawStats.penFlat,
            penRatio: rawStats.penRatio,
            defReduction: rawStats.defReduction, // Mapped for Def Shred
            def: rawStats.def, // Preserve DEF just in case
            skillMultiplier: skillMultiplier // Pass the custom multiplier
        };

        const tResult = await optimizerService.calculateTheoretical(cleanRawStats, enemy, 0); 
        tResult.description = `Direct Calculation // 直伤 (MV: ${skillMultiplier}%)`;
        setTheoreticalResult(tResult);

      } else {
        // Inventory Mode
        // CRITICAL FIX: Explicitly clear theoretical result
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
            onOpenCustomModal={() => setShowCustomModal(true)}
            customAgents={customAgents}
            customEngines={customEngines}
            budget={budget}
            setBudget={setBudget}
            skillMultiplier={skillMultiplier}
            setSkillMultiplier={setSkillMultiplier}
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

      {/* Global Custom Data Modal */}
      {showCustomModal && (
        <CustomDataModal 
           onClose={() => setShowCustomModal(false)}
           onSaveAgent={(a) => setCustomAgents([...customAgents, a])}
           onSaveEngine={(e) => setCustomEngines([...customEngines, e])}
           onSaveSet={(s) => setCustomSets([...customSets, s])}
        />
      )}

    </MainLayout>
  );
};