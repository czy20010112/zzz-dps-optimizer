
import { BaseStats, DiscItem, EnemyStats, OptimizationResult, BuildResult, TheoreticalConfig } from '../types';
import { DISC_SETS } from '../data/disc_sets';
import { addStat, applyItemStats, applySetBonuses, MAIN_STAT_VALUES } from '../utils/statCalculator';

// NOTE: Ideally customSets should be passed from the main thread via WorkerRequest. 
// We default to [] for custom sets in this worker context to avoid signature changes.
const CUSTOM_SETS_MOCK: any[] = []; 

const calculateDamage = (stats: BaseStats, enemy: EnemyStats): number => {
  const skillMult = stats.skillMultiplier ? (stats.skillMultiplier / 100) : 25.0;

  const finalAtk = stats.atkBase * (1 + stats.atkPercent / 100) + stats.atkFlat;
  const effectiveCritRate = Math.min(1.0, Math.max(0, stats.critRate / 100));
  const critMultiplier = 1 + effectiveCritRate * (stats.critDmg / 100);
  const dmgMultiplier = 1 + stats.dmgBonus / 100;

  const DEF_COEFF = 794; 
  const penRatioVal = stats.penRatio / 100;
  const defReductionVal = (stats.defReduction || 0) / 100; 
  const effectiveDef = Math.max(0, enemy.def * (1 - penRatioVal) * (1 - defReductionVal) - stats.penFlat);
  const defMultiplier = DEF_COEFF / (effectiveDef + DEF_COEFF);

  const enemyRes = enemy.res;
  const resShred = stats.resReduction || 0;
  const effectiveRes = enemyRes - resShred; 
  const resMultiplier = 1 - (effectiveRes / 100); 

  let stunMultValue = 1.0;
  if (enemy.stunned) {
     stunMultValue = enemy.stunMultiplier ? (enemy.stunMultiplier / 100) : 1.5;
  }

  const baseDmg = finalAtk * skillMult;
  return baseDmg * critMultiplier * dmgMultiplier * defMultiplier * resMultiplier * stunMultValue;
};

// Helper: Generates a condensed label for the build (e.g., "Woodpecker(4) + Hormone(2)")
const generateCompactComboName = (combo: DiscItem[]): string => {
  const setCounts: Record<string, number> = {};
  combo.forEach(c => {
    if (c.set) setCounts[c.set] = (setCounts[c.set] || 0) + 1;
  });

  const parts: string[] = [];
  
  Object.entries(setCounts).forEach(([setId, count]) => {
    // Task 2: Ensure ID lookup is robust if Name is used accidentally
    const setDef = DISC_SETS.find(s => s.id === setId || s.name.en === setId);
    const displayName = setDef ? setDef.name.en : setId; 

    if (count >= 4) {
      parts.push(`${displayName}(4)`);
    } else if (count >= 2) {
      parts.push(`${displayName}(2)`);
    }
  });

  return parts.length > 0 ? parts.join(' + ') : 'Rainbow Set';
};

export const runTheoreticalOptimizer = (
    baseStats: BaseStats, 
    enemy: EnemyStats, 
    budget: number, 
    config?: TheoreticalConfig 
): OptimizationResult => {
  const actualBudget = budget > 0 ? budget : 45;
  const isZeroBudget = budget === 0;
  // Task 1: Detect Raw Mode
  const isRaw = config?.isRaw === true;

  console.log(`Optimizer: Running Theoretical`, { budget: actualBudget, config });
  
  // Task 1: If Raw Mode, skip ALL default main stat additions and set optimizations
  if (isRaw) {
     const usedSkillMult = baseStats.skillMultiplier ? (baseStats.skillMultiplier / 100) : 25.0;
     const damage = calculateDamage(baseStats, enemy);
     return {
        dps: damage,
        stats: baseStats,
        skillMultiplier: usedSkillMult,
        activeSetBonuses: ['Direct Raw Calculation'],
        description: 'Direct Calculation'
     };
  }

  const statsWithMains = { ...baseStats };

  // Only add default 1-2-3 stats if NOT Raw mode (already handled by early return, but kept explicitly safe)
  addStat(statsWithMains, 'hp', MAIN_STAT_VALUES['hp']);
  addStat(statsWithMains, 'atk', MAIN_STAT_VALUES['atk']);
  addStat(statsWithMains, 'def', MAIN_STAT_VALUES['def']);

  if (config) {
    if (config.slot4 && MAIN_STAT_VALUES[config.slot4]) addStat(statsWithMains, config.slot4, MAIN_STAT_VALUES[config.slot4]);
    if (config.slot5 && MAIN_STAT_VALUES[config.slot5]) addStat(statsWithMains, config.slot5, MAIN_STAT_VALUES[config.slot5]);
    if (config.slot6 && MAIN_STAT_VALUES[config.slot6]) addStat(statsWithMains, config.slot6, MAIN_STAT_VALUES[config.slot6]);
  }

  let bestSetDps = -1;
  let bestStats = { ...statsWithMains };
  let bestComboName = 'Rainbow / No Set';

  if (!isZeroBudget) {
    const validSets = DISC_SETS.filter(s => s.stats2pc || s.stats4pc);
    
    for (const setA of validSets) {
        if (!setA.stats4pc) continue;

        for (const setB of validSets) {
            const isSameSet = setA.id === setB.id;
            const currentStats = { ...statsWithMains };

            if (setA.stats2pc) Object.entries(setA.stats2pc).forEach(([k,v]) => addStat(currentStats, k, v as number));
            if (setA.stats4pc) Object.entries(setA.stats4pc).forEach(([k,v]) => addStat(currentStats, k, v as number));

            if (!isSameSet && setB.stats2pc) {
                Object.entries(setB.stats2pc).forEach(([k,v]) => addStat(currentStats, k, v as number));
            }

            const optimizedStats = optimizeSubstats(currentStats, enemy, actualBudget);
            const dps = calculateDamage(optimizedStats, enemy);

            if (dps > bestSetDps) {
                bestSetDps = dps;
                bestStats = optimizedStats;
                
                if (isSameSet) {
                    bestComboName = `${setA.name.en}(4)`; 
                } else {
                    bestComboName = `${setA.name.en}(4) + ${setB.name.en}(2)`;
                }
            }
        }
    }
  } else {
    // If Zero Budget but NOT Raw (rare case of "Base Stats Only" theoretical), we calculate as is
    bestStats = { ...statsWithMains };
    bestSetDps = calculateDamage(bestStats, enemy);
  }

  const usedSkillMult = bestStats.skillMultiplier ? (bestStats.skillMultiplier / 100) : 25.0;

  return {
    dps: bestSetDps,
    stats: bestStats,
    skillMultiplier: usedSkillMult,
    activeSetBonuses: isZeroBudget 
        ? ['No Substats Added'] 
        : [`Theoretical (+${actualBudget} Rolls)`, bestComboName],
    // Updated Description Format
    description: isZeroBudget 
        ? `Base Calculation` 
        : `Theoretical Substats (${actualBudget} Rolls) / ${bestComboName}`
  };
};

const optimizeSubstats = (base: BaseStats, enemy: EnemyStats, budget: number): BaseStats => {
    const currentStats = { ...base };
    const upgrades: { stat: string; value: number }[] = [
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

  const TOP_K = 100;
  let topBuilds: { dps: number; combo: DiscItem[]; stats: BaseStats; activeBonuses: string[] }[] = [];
  
  const currentCombo: DiscItem[] = [];

  const backtrack = (slotIndex: number) => {
    if (slotIndex === 6) {
      let finalStats = applyItemStats(baseStats, currentCombo);
      finalStats.skillMultiplier = baseStats.skillMultiplier;
      
      const setInfo = applySetBonuses(finalStats, currentCombo, CUSTOM_SETS_MOCK);
      finalStats = setInfo.stats;
      const activeBonuses = setInfo.activeBonuses;

      const dps = calculateDamage(finalStats, enemy);
      
      if (topBuilds.length < TOP_K) {
        topBuilds.push({ dps, combo: [...currentCombo], stats: finalStats, activeBonuses });
        topBuilds.sort((a, b) => b.dps - a.dps);
      } else if (dps > topBuilds[topBuilds.length - 1].dps) {
        topBuilds.pop();
        topBuilds.push({ dps, combo: [...currentCombo], stats: finalStats, activeBonuses });
        topBuilds.sort((a, b) => b.dps - a.dps);
      }
      return;
    }

    const itemsInSlot = slots[slotIndex];
    for (const item of itemsInSlot) {
      currentCombo.push(item);
      backtrack(slotIndex + 1);
      currentCombo.pop();
    }
  };

  backtrack(0);

  const best = topBuilds[0] || { dps: 0, stats: baseStats, combo: [], activeBonuses: [] };
  const mvDisplay = baseStats.skillMultiplier ? baseStats.skillMultiplier : 2500;
  const usedSkillMult = baseStats.skillMultiplier ? (baseStats.skillMultiplier / 100) : 25.0;

  const formattedTopBuilds: BuildResult[] = topBuilds.map((b, idx) => {
    return {
      rank: idx + 1,
      dps: b.dps,
      comboName: generateCompactComboName(b.combo),
      stats: b.stats,
      combo: b.combo
    };
  });

  return {
    dps: best.dps,
    stats: best.stats,
    combo: best.combo,
    skillMultiplier: usedSkillMult,
    activeSetBonuses: best.activeBonuses,
    topBuilds: formattedTopBuilds,
    description: `Best Build (Skill MV: ${mvDisplay}%)`
  };
};
