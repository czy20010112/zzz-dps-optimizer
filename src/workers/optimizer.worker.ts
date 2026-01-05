import { BaseStats, DiscItem, EnemyStats, OptimizationResult, StatType, BuildResult, TheoreticalConfig, DiscSetData } from '../types';
import { DISC_SETS } from '../data/disc_sets'; // Import static data

// --- Core Logic ---
const addStat = (stats: BaseStats, statType: StatType, value: number) => {
  switch (statType) {
    case 'atk': stats.atkFlat += value; break;
    case 'atk_': stats.atkPercent += value; break;
    case 'def': stats.def += value; break;
    case 'def_': stats.def += (stats.def * (value/100)); break; 
    case 'hp': stats.hp += value; break;
    case 'hp_': stats.hp += (stats.hp * (value/100)); break;
    case 'critRate': stats.critRate += value; break;
    case 'critDmg': stats.critDmg += value; break;
    case 'pen': stats.penFlat += value; break;
    case 'pen_': stats.penRatio += value; break;
    case 'elemental': stats.dmgBonus += value; break;
    case 'impact': stats.impact += value; break;
    case 'mastery': stats.anomalyMastery += value; break;
    case 'anomaly': stats.anomalyProficiency += value; break;
    case 'resReduction': stats.resReduction += value; break;
    case 'defReduction': stats.defReduction += value; break;
    case 'energy': break; 
  }
};

const applyItemStats = (base: BaseStats, items: DiscItem[]): BaseStats => {
  const newStats = { ...base };
  items.forEach(item => {
    item.subStats.forEach(sub => {
      addStat(newStats, sub.stat, sub.value);
    });
  });
  return newStats;
};

// --- New Helper: Apply Set Bonuses ---
const applySetBonuses = (stats: BaseStats, items: DiscItem[]): BaseStats => {
    const finalStats = { ...stats };
    const setCounts: Record<string, number> = {};
    items.forEach(i => setCounts[i.set] = (setCounts[i.set] || 0) + 1);

    Object.entries(setCounts).forEach(([setId, count]) => {
        // Find set definition
        const setData = DISC_SETS.find(s => s.id === setId || s.name.en === setId); // Basic lookup
        
        if (setData) {
            // Apply 2pc
            if (count >= 2 && setData.stats2pc) {
                Object.entries(setData.stats2pc).forEach(([key, val]) => {
                   if (typeof val === 'number') addStat(finalStats, key as StatType, val);
                });
            }
            // Apply 4pc
            if (count >= 4 && setData.stats4pc) {
                Object.entries(setData.stats4pc).forEach(([key, val]) => {
                   if (typeof val === 'number') addStat(finalStats, key as StatType, val);
                });
            }
        }
    });

    return finalStats;
};

const calculateDamage = (stats: BaseStats, enemy: EnemyStats): number => {
  const skillMult = stats.skillMultiplier ? (stats.skillMultiplier / 100) : 25.0;

  // 1. ATK Area
  const finalAtk = stats.atkBase * (1 + stats.atkPercent / 100) + stats.atkFlat;
  
  // 2. Crit Area
  const effectiveCritRate = Math.min(1.0, Math.max(0, stats.critRate / 100));
  const critMultiplier = 1 + effectiveCritRate * (stats.critDmg / 100);

  // 3. DMG Bonus
  const dmgMultiplier = 1 + stats.dmgBonus / 100;

  // 4. Defense Area
  const DEF_COEFF = 794; 
  const penRatioVal = stats.penRatio / 100;
  const defReductionVal = (stats.defReduction || 0) / 100; 
  const effectiveDef = Math.max(0, enemy.def * (1 - penRatioVal) * (1 - defReductionVal) - stats.penFlat);
  const defMultiplier = DEF_COEFF / (effectiveDef + DEF_COEFF);

  // 5. Resistance Area
  const enemyRes = enemy.res;
  const resShred = stats.resReduction || 0;
  const effectiveRes = enemyRes - resShred; 
  const resMultiplier = 1 - (effectiveRes / 100); 

  // 6. Stun
  let stunMultValue = 1.0;
  if (enemy.stunned) {
     stunMultValue = enemy.stunMultiplier ? (enemy.stunMultiplier / 100) : 1.5;
  }

  const baseDmg = finalAtk * skillMult;
  return baseDmg * critMultiplier * dmgMultiplier * defMultiplier * resMultiplier * stunMultValue;
};

const getSetBonuses = (items: DiscItem[]): string[] => {
    const setCounts: Record<string, number> = {};
    items.forEach(i => setCounts[i.set] = (setCounts[i.set] || 0) + 1);
    const bonuses: string[] = [];
    Object.entries(setCounts).forEach(([name, count]) => {
        // Return ID:Count format for UI parsing
        // E.g., "Woodpecker:4"
        const setData = DISC_SETS.find(s => s.id === name);
        const id = setData ? setData.id : name;
        
        if (count >= 4) bonuses.push(`${id}:4`);
        else if (count >= 2) bonuses.push(`${id}:2`);
    });
    return bonuses;
};

// S-Rank Level 15 Main Stat Values
const MAIN_STAT_VALUES: Record<string, number> = {
  'hp': 2200,    // Slot 1
  'atk': 316,    // Slot 2 / Slot 4,5,6
  'def': 184,    // Slot 3
  'critRate': 24, // Slot 4
  'critDmg': 48,  // Slot 4
  'atk_': 30,     // Slot 4,5,6
  'anomaly': 92,  // Slot 4
  'elemental': 30,// Slot 5
  'pen_': 24,     // Slot 5
  'impact': 18,   // Slot 6
  'mastery': 30,  // Slot 6
  'energy': 20,   // Slot 6
};

// Task 1: Improved Theoretical Optimizer with Set Traversal
export const runTheoreticalOptimizer = (
    baseStats: BaseStats, 
    enemy: EnemyStats, 
    budget: number, 
    config?: TheoreticalConfig 
): OptimizationResult => {
  const actualBudget = budget > 0 ? budget : 45;
  const isZeroBudget = budget === 0;

  console.log(`Optimizer: Running Theoretical`, { budget: actualBudget, config });
  
  // Base setup with fixed main stats (Slot 1-3 + Config 4-6)
  const statsWithMains = { ...baseStats };

  if (config) {
    addStat(statsWithMains, 'hp', MAIN_STAT_VALUES['hp']);
    addStat(statsWithMains, 'atk', MAIN_STAT_VALUES['atk']);
    addStat(statsWithMains, 'def', MAIN_STAT_VALUES['def']);

    if (config.slot4 && MAIN_STAT_VALUES[config.slot4]) addStat(statsWithMains, config.slot4, MAIN_STAT_VALUES[config.slot4]);
    if (config.slot5 && MAIN_STAT_VALUES[config.slot5]) addStat(statsWithMains, config.slot5, MAIN_STAT_VALUES[config.slot5]);
    if (config.slot6 && MAIN_STAT_VALUES[config.slot6]) addStat(statsWithMains, config.slot6, MAIN_STAT_VALUES[config.slot6]);
  }

  let bestSetDps = -1;
  let bestStats = { ...statsWithMains };
  let bestComboParts: string[] = [];

  if (!isZeroBudget) {
    // 1. Identify Valid Sets
    const validSets = DISC_SETS.filter(s => s.stats2pc || s.stats4pc);
    
    // 2. Iterate Set Combinations: 4pc Set A + 2pc Set B
    for (const setA of validSets) {
        if (!setA.stats4pc) continue;

        for (const setB of validSets) {
            // A set cannot be its own 2pc pair in this logic (4+2 of same set is just 4pc)
            // But we allow "Rainbow 4pc" if setA == setB (just 4pc stats), though usually we want 4+2 distinct.
            const isSameSet = setA.id === setB.id;
            
            const currentStats = { ...statsWithMains };

            // Apply Set A (4pc = 2pc + 4pc stats)
            if (setA.stats2pc) Object.entries(setA.stats2pc).forEach(([k,v]) => addStat(currentStats, k as StatType, v as number));
            if (setA.stats4pc) Object.entries(setA.stats4pc).forEach(([k,v]) => addStat(currentStats, k as StatType, v as number));

            // Apply Set B (2pc) if distinct
            if (!isSameSet && setB.stats2pc) {
                Object.entries(setB.stats2pc).forEach(([k,v]) => addStat(currentStats, k as StatType, v as number));
            }

            // 3. Optimize Substats on top of these set bonuses
            const optimizedStats = optimizeSubstats(currentStats, enemy, actualBudget);
            const dps = calculateDamage(optimizedStats, enemy);

            if (dps > bestSetDps) {
                bestSetDps = dps;
                bestStats = optimizedStats;
                
                // Construct ID based combo info for UI to parse (ID:Count)
                if (isSameSet) {
                    bestComboParts = [`${setA.id}:4`];
                } else {
                    bestComboParts = [`${setA.id}:4`, `${setB.id}:2`];
                }
            }
        }
    }
  } else {
    // Zero budget (Direct Calc)
    bestStats = { ...statsWithMains };
    bestSetDps = calculateDamage(bestStats, enemy);
  }

  const usedSkillMult = bestStats.skillMultiplier ? (bestStats.skillMultiplier / 100) : 25.0;

  return {
    dps: bestSetDps,
    stats: bestStats,
    skillMultiplier: usedSkillMult,
    activeSetBonuses: isZeroBudget 
        ? ['Manual:0'] // ID format
        : bestComboParts,
    description: isZeroBudget ? `Direct Calculation` : `Theoretical Max`
  };
};

// Helper: Greedy Substat Optimizer
const optimizeSubstats = (base: BaseStats, enemy: EnemyStats, budget: number): BaseStats => {
    const currentStats = { ...base };
    const upgrades: { stat: StatType; value: number }[] = [
      { stat: 'atk_', value: 3.0 },
      { stat: 'critRate', value: 2.4 },
      { stat: 'critDmg', value: 4.8 },
      { stat: 'pen', value: 9 },
      { stat: 'atk', value: 19 },
    ];

    for (let i = 0; i < budget; i++) {
      let bestUpgradeIdx = -1;
      let bestNewDps = -1;

      for (let j = 0; j < upgrades.length; j++) {
        const testStats = { ...currentStats };
        addStat(testStats, upgrades[j].stat, upgrades[j].value);
        
        const dps = calculateDamage(testStats, enemy);
        if (dps > bestNewDps) {
          bestNewDps = dps;
          bestUpgradeIdx = j;
        }
      }

      if (bestUpgradeIdx !== -1) {
        addStat(currentStats, upgrades[bestUpgradeIdx].stat, upgrades[bestUpgradeIdx].value);
      }
    }
    return currentStats;
};

export const runInventoryOptimizer = (baseStats: BaseStats, enemy: EnemyStats, inventory: DiscItem[]): OptimizationResult => {
  const slots: DiscItem[][] = [[], [], [], [], [], []];
  inventory.forEach(item => {
    if (item.slot >= 1 && item.slot <= 6) {
      slots[item.slot - 1].push(item);
    }
  });

  for (let i = 0; i < 6; i++) {
    if (slots[i].length === 0) {
      return { dps: 0, stats: baseStats, description: `Error: Missing items in Slot ${i + 1}` };
    }
  }

  const TOP_K = 5;
  let topBuilds: { dps: number; combo: DiscItem[]; stats: BaseStats }[] = [];
  const currentCombo: DiscItem[] = new Array(6);

  const backtrack = (slotIndex: number) => {
    if (slotIndex === 6) {
      // 1. Apply Individual Disc Stats
      let finalStats = applyItemStats(baseStats, currentCombo);
      finalStats.skillMultiplier = baseStats.skillMultiplier;
      
      // 2. Apply Set Bonus Stats
      finalStats = applySetBonuses(finalStats, currentCombo);

      // 3. Calc
      const dps = calculateDamage(finalStats, enemy);
      
      if (topBuilds.length < TOP_K) {
        topBuilds.push({ dps, combo: [...currentCombo], stats: finalStats });
        topBuilds.sort((a, b) => b.dps - a.dps);
      } else if (dps > topBuilds[topBuilds.length - 1].dps) {
        topBuilds.pop();
        topBuilds.push({ dps, combo: [...currentCombo], stats: finalStats });
        topBuilds.sort((a, b) => b.dps - a.dps);
      }
      return;
    }

    const itemsInSlot = slots[slotIndex];
    for (const item of itemsInSlot) {
      currentCombo[slotIndex] = item;
      backtrack(slotIndex + 1);
    }
  };

  backtrack(0);

  const best = topBuilds[0] || { dps: 0, stats: baseStats, combo: [] };
  const mvDisplay = baseStats.skillMultiplier ? baseStats.skillMultiplier : 2500;
  const usedSkillMult = baseStats.skillMultiplier ? (baseStats.skillMultiplier / 100) : 25.0;
  const bestSetBonuses = getSetBonuses(best.combo || []);
  
  // Task 4: Populate full stats and combo for topBuilds
  const formattedTopBuilds: BuildResult[] = topBuilds.map((b, idx) => {
    // getSetBonuses returns IDs e.g. "Woodpecker:4"
    const sets = getSetBonuses(b.combo);
    return {
      rank: idx + 1,
      dps: b.dps,
      comboName: sets.length > 0 ? sets.join(' + ') : "Rainbow:0",
      stats: b.stats, 
      combo: b.combo  
    };
  });

  return {
    dps: best.dps,
    stats: best.stats,
    combo: best.combo,
    skillMultiplier: usedSkillMult,
    activeSetBonuses: bestSetBonuses,
    topBuilds: formattedTopBuilds,
    description: `Best Build (Skill MV: ${mvDisplay}%)`
  };
};