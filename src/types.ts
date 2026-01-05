export type StatType = 
  | 'atk' | 'atk_' | 'def' | 'def_' | 'hp' | 'hp_' 
  | 'critRate' | 'critDmg' | 'pen' | 'pen_' 
  | 'impact' | 'anomaly' | 'mastery' | 'elemental'
  | 'energy' | 'resReduction' | 'defReduction'; // Added for completeness

export interface BaseStats {
  atkBase: number;
  atkFlat: number;
  atkPercent: number;
  critRate: number;
  critDmg: number;
  penFlat: number;
  penRatio: number;
  defReduction: number; // Def Shred + Ignore Def %
  resReduction: number; // Resist Shred %
  dmgBonus: number;
  def: number;
  hp: number;
  impact: number;
  anomalyMastery: number;
  anomalyProficiency: number;
  
  // Optional field for custom skill multiplier
  skillMultiplier?: number;
}

export interface EnemyStats {
  def: number;
  res: number;
  stunned: boolean;
  stunMultiplier: number;
  level: number;
}

export interface DiscItem {
  id: string;
  slot: number;
  set: string;
  mainStat: StatType;
  subStats: { stat: StatType; value: number }[];
}

export interface BuildResult {
  rank: number;
  dps: number;
  comboName: string;
  // Added for Task 4: Detailed view
  stats: BaseStats;
  combo: DiscItem[];
}

export interface OptimizationResult {
  dps: number;
  stats: BaseStats; 
  combo?: DiscItem[]; 
  topBuilds?: BuildResult[];
  description?: string;
  skillMultiplier?: number;
  activeSetBonuses?: string[];
}

export interface AgentData {
  id: string;
  name: { en: string; cn: string };
  stats: Partial<BaseStats>;
}

export interface EngineData {
  id: string;
  name: { en: string; cn: string };
  stats: Partial<BaseStats>; // Includes Base ATK + Secondary Stat + Passive Buffs
}

export interface DiscSetData {
  id: string; 
  name: { en: string; cn: string };
  stats2pc?: Partial<BaseStats>;
  stats4pc?: Partial<BaseStats>;
}

export interface CustomSetData {
  id: string;
  name: string;
  pieces2: { stat: StatType; value: number }[];
  pieces4: { stat: StatType; value: number }[];
}

// New Config for Theoretical Mode Main Stats
export interface TheoreticalConfig {
  slot4: StatType;
  slot5: StatType;
  slot6: StatType;
}

export type WorkerRequestType = 'CALCULATE_THEORETICAL' | 'OPTIMIZE_INVENTORY';

export interface WorkerRequest {
  id: string;
  type: WorkerRequestType;
  payload: {
    stats: BaseStats;
    enemy: EnemyStats;
    inventory?: DiscItem[];
    constraint?: {
      substatBudget?: number;
      theoreticalConfig?: TheoreticalConfig; // Added this
    };
  };
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  data?: OptimizationResult;
  error?: string;
}

export type AppMode = 'theoretical' | 'inventory' | 'raw';