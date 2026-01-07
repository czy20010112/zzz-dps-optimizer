
import { BaseStats, DiscItem, AgentData, EngineData, CustomSetData, StatType } from '../types';
import { DISC_SETS } from '../data/disc_sets';

// --- Constants ---
export const MAIN_STAT_VALUES: Record<string, number> = {
  'hp': 2200,    'atk': 316,    'def': 184,
  'critRate': 24, 'critDmg': 48,  
  'atk_': 30,     'hp_': 30,      'def_': 30,
  'anomaly': 92,  'elemental': 30, 'pen_': 24,
  'impact': 18,   'mastery': 30,  'energy': 20,
};

// --- Pure Helper Functions ---

export const addStat = (stats: BaseStats, statType: string, value: number) => {
  if (!stats) return; 
  
  switch (statType) {
    case 'atk': 
    case 'atkFlat': stats.atkFlat += value; break;
    case 'def': 
    case 'defFlat': stats.def += value; break;
    case 'hp': 
    case 'hpFlat': stats.hp += value; break;
    case 'impact': stats.impact += value; break;
    case 'pen': 
    case 'penFlat': stats.penFlat += value; break;

    case 'atk_': 
    case 'atkPercent': stats.atkPercent += value; break;
    
    case 'def_': 
    case 'defPercent': stats.def += (stats.def * (value/100)); break;
    case 'hp_': 
    case 'hpPercent': stats.hp += (stats.hp * (value/100)); break;
      
    case 'critRate': stats.critRate += value; break;
    case 'critDmg': stats.critDmg += value; break;
      
    case 'pen_': 
    case 'penRatio': stats.penRatio += value; break;
      
    case 'elemental': 
    case 'dmgBonus': stats.dmgBonus += value; break;
      
    case 'mastery': 
    case 'anomalyMastery': stats.anomalyMastery += value; break;
      
    case 'anomaly': 
    case 'anomalyProficiency': stats.anomalyProficiency += value; break;
      
    case 'resReduction': stats.resReduction += value; break;
    case 'defReduction': stats.defReduction += value; break;
      
    case 'energy': stats.energy += value; break;
    default: break;
  }
};

export const applyItemStats = (base: BaseStats, items: DiscItem[]): BaseStats => {
  const newStats = { ...base };
  items.forEach(item => {
    if (item.subStats) {
        item.subStats.forEach(sub => {
            addStat(newStats, sub.stat, sub.value);
        });
    }
    if (item.mainStat) {
      const mainVal = MAIN_STAT_VALUES[item.mainStat];
      if (mainVal) {
        addStat(newStats, item.mainStat, mainVal);
      }
    }
  });
  return newStats;
};

// Helper for display strings
const formatStatValue = (key: string, val: number) => {
    const isPct = ['atkPercent','defPercent','hpPercent','critRate','critDmg','penRatio','dmgBonus','resReduction','defReduction','atk_','def_','hp_','pen_','elemental'].includes(key);
    return `${val > 0 ? '+' : ''}${val}${isPct ? '%' : ''}`;
};

const getStatLabel = (key: string) => {
    const map: Record<string, string> = {
        'atkPercent': 'ATK', 'critRate': 'CRIT', 'critDmg': 'CDMG', 'dmgBonus': 'DMG',
        'penRatio': 'PEN%', 'anomalyProficiency': 'AP', 'energy': 'ER',
        'atk_': 'ATK', 'pen_': 'PEN%', 'elemental': 'DMG'
    };
    return map[key] || key.toUpperCase();
};

/**
 * Analyzes inventory items, finds sets (System + Custom), applies bonuses, 
 * and generates detailed active strings.
 */
export const applySetBonuses = (
    stats: BaseStats, 
    items: DiscItem[], 
    customSets: CustomSetData[] = []
): { stats: BaseStats, activeBonuses: string[] } => {
    const finalStats = { ...stats };
    const setCounts: Record<string, number> = {};
    const activeBonuses: string[] = [];

    // Count equipped sets
    items.forEach(i => {
        if (i && i.set) setCounts[i.set] = (setCounts[i.set] || 0) + 1;
    });

    Object.entries(setCounts).forEach(([setId, count]) => {
        // Look in System DB
        const systemSet = DISC_SETS.find(s => s.id === setId || s.name.en === setId || s.name.cn === setId);
        // Look in Custom DB
        const customSet = customSets.find(s => s.id === setId || s.name === setId);

        const displayName = systemSet ? systemSet.name.en : (customSet ? customSet.name : setId);

        // --- Apply 2-Piece ---
        if (count >= 2) {
            let desc = '';
            if (systemSet && systemSet.stats2pc) {
                Object.entries(systemSet.stats2pc).forEach(([key, val]) => {
                   if (typeof val === 'number') {
                       addStat(finalStats, key, val);
                       desc += ` ${formatStatValue(key, val)} ${getStatLabel(key)}`;
                   }
                });
            } else if (customSet && customSet.pieces2) {
                customSet.pieces2.forEach(p => {
                    addStat(finalStats, p.stat, p.value);
                    desc += ` ${formatStatValue(p.stat, p.value)} ${getStatLabel(p.stat)}`;
                });
            }
            if (desc) activeBonuses.push(`${displayName} (2):${desc}`);
        }

        // --- Apply 4-Piece ---
        if (count >= 4) {
            let desc = '';
            if (systemSet && systemSet.stats4pc) {
                Object.entries(systemSet.stats4pc).forEach(([key, val]) => {
                   if (typeof val === 'number') {
                       addStat(finalStats, key, val);
                       desc += ` ${formatStatValue(key, val)} ${getStatLabel(key)}`;
                   }
                });
            } else if (customSet && customSet.pieces4) {
                customSet.pieces4.forEach(p => {
                    addStat(finalStats, p.stat, p.value);
                    desc += ` ${formatStatValue(p.stat, p.value)} ${getStatLabel(p.stat)}`;
                });
            }
            if (desc) activeBonuses.push(`${displayName} (4):${desc}`);
        }
    });

    return { stats: finalStats, activeBonuses };
};

/**
 * Main Function: Calculate Final Stats from all sources.
 */
export const calculateFinalStats = (
    baseAgent: AgentData | undefined,
    engine: EngineData | undefined,
    equippedDiscs: DiscItem[] = [],
    manualBuffs: Partial<BaseStats> = {},
    customSets: CustomSetData[] = [],
    isRawMode: boolean = false // Added flag
): BaseStats => {
    // 0. Defaults
    const stats: BaseStats = {
      atkBase: 0, atkFlat: 0, atkPercent: 0,
      critRate: 5, critDmg: 50,
      dmgBonus: 0, penRatio: 0, penFlat: 0,
      defReduction: 0, resReduction: 0,
      def: 600, hp: 10000, impact: 100,
      anomalyMastery: 100, anomalyProficiency: 100,
      energy: 100,
    };

    // If RAW mode, we ignore Agent/Engine base stats and assume inputs are total stats.
    if (isRawMode) {
        if (manualBuffs) {
            Object.entries(manualBuffs).forEach(([k, v]) => {
                // In raw mode, we treat inputs as direct overrides or additions to zero
                if (typeof v === 'number') {
                    // For base stats, we set them if provided, else keep 0
                   if (k === 'atkBase') stats.atkBase = v;
                   else if (k === 'def') stats.def = v;
                   else if (k === 'hp') stats.hp = v;
                   else addStat(stats, k, v);
                }
            });
        }
        return stats;
    }

    // --- Standard Calculation ---

    // 1. Agent Base
    if (baseAgent?.stats) {
        if (baseAgent.stats.atkBase) stats.atkBase = baseAgent.stats.atkBase;
        if (baseAgent.stats.hp) stats.hp = baseAgent.stats.hp;
        if (baseAgent.stats.def) stats.def = baseAgent.stats.def;
        if (baseAgent.stats.impact) stats.impact = baseAgent.stats.impact;
        if (baseAgent.stats.anomalyMastery) stats.anomalyMastery = baseAgent.stats.anomalyMastery;
        if (baseAgent.stats.critRate) stats.critRate = baseAgent.stats.critRate;
        if (baseAgent.stats.critDmg) stats.critDmg = baseAgent.stats.critDmg;
        
        Object.entries(baseAgent.stats).forEach(([k, v]) => {
             if (!['atkBase','hp','def','impact','anomalyMastery','critRate','critDmg','extra'].includes(k)) {
                 addStat(stats, k, v as number);
             }
        });
        
        if ((baseAgent.stats as any).extra?.skillMultiplier) {
            stats.skillMultiplier = (baseAgent.stats as any).extra.skillMultiplier;
        }
    }

    // 2. Engine Base & Passives
    if (engine?.stats) {
        if (engine.stats.atkBase) stats.atkBase += engine.stats.atkBase;
        
        Object.entries(engine.stats).forEach(([k, v]) => {
            if (k !== 'atkBase' && typeof v === 'number') {
                addStat(stats, k, v);
            }
        });
    }

    // 3. Equipped Discs (Inventory Mode)
    let intermediateStats = applyItemStats(stats, equippedDiscs);

    // 4. Set Bonuses (System + Custom)
    const setRes = applySetBonuses(intermediateStats, equippedDiscs, customSets);
    intermediateStats = setRes.stats;

    // 5. Manual Buffs
    if (manualBuffs) {
        Object.entries(manualBuffs).forEach(([k, v]) => {
            if (typeof v === 'number') addStat(intermediateStats, k, v);
        });
    }

    return intermediateStats;
};
