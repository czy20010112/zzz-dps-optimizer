import { BaseStats, DiscItem, EnemyStats, OptimizationResult, StatType, BuildResult } from '../types';

// --- Core Logic ---
const addStat = (stats: BaseStats, statType: StatType, value: number) => {
  switch (statType) {
    case 'atk': stats.atkFlat += value; break;
    case 'atk_': stats.atkPercent += value; break;
    case 'def': stats.def += value; break;
    case 'hp': stats.hp += value; break;
    case 'critRate': stats.critRate += value; break;
    case 'critDmg': stats.critDmg += value; break;
    case 'pen': stats.penFlat += value; break;
    case 'pen_': stats.penRatio += value; break;
    case 'elemental': stats.dmgBonus += value; break;
    case 'impact': stats.impact += value; break;
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

const calculateDamage = (stats: BaseStats, enemy: EnemyStats): number => {
  // Dynamic Skill Multiplier (Default to 25.0 / 2500% if undefined)
  // Input is usually percentage (e.g. 2500), convert to ratio for calculation
  const skillMult = stats.skillMultiplier ? (stats.skillMultiplier / 100) : 25.0;

  // 1. ATK Area
  const finalAtk = stats.atkBase * (1 + stats.atkPercent / 100) + stats.atkFlat;
  
  // 2. Crit Area
  const effectiveCritRate = Math.min(1.0, Math.max(0, stats.critRate / 100));
  const critMultiplier = 1 + effectiveCritRate * (stats.critDmg / 100);

  // 3. DMG Bonus
  const dmgMultiplier = 1 + stats.dmgBonus / 100;

  // 4. Defense Area
  // Formula: Coeff / (EnemyDef * (1 - PenRatio) * (1 - DefReduction) - PenFlat + Coeff)
  const penRatioVal = stats.penRatio / 100;
  const defReductionVal = (stats.defReduction || 0) / 100; 
  
  const effectiveDef = Math.max(0, enemy.def * (1 - penRatioVal) * (1 - defReductionVal) - stats.penFlat);
  const defConstant = 800 + enemy.level * 10;
  const defMultiplier = 1 - (effectiveDef / (effectiveDef + defConstant));

  // 5. Resistance
  const resMultiplier = 1 - (enemy.res / 100);

  // 6. Stun
  // Use enemy.stunMultiplier (percent) if set, otherwise default 150% if stunned
  let stunMultValue = 1.0;
  if (enemy.stunned) {
     stunMultValue = enemy.stunMultiplier ? (enemy.stunMultiplier / 100) : 1.5;
  }

  // 7. Base DMG
  const baseDmg = finalAtk * skillMult;

  return baseDmg * critMultiplier * dmgMultiplier * defMultiplier * resMultiplier * stunMultValue;
};

// --- Algorithms ---

export const runTheoreticalOptimizer = (baseStats: BaseStats, enemy: EnemyStats, budget: number): OptimizationResult => {
  const actualBudget = budget > 0 ? budget : 45;
  const isZeroBudget = budget === 0;

  console.log(`Optimizer: Running Theoretical with ${actualBudget} rolls`);
  
  const currentStats = { ...baseStats };
  
  if (!isZeroBudget) {
    const upgrades: { stat: StatType; value: number }[] = [
      { stat: 'atk_', value: 3.0 },
      { stat: 'critRate', value: 2.4 },
      { stat: 'critDmg', value: 4.8 },
      { stat: 'pen', value: 9 },
      { stat: 'atk', value: 19 },
    ];

    for (let i = 0; i < actualBudget; i++) {
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
  }

  const finalDps = calculateDamage(currentStats, enemy);
  const usedSkillMult = currentStats.skillMultiplier ? (currentStats.skillMultiplier / 100) : 25.0;

  return {
    dps: finalDps,
    stats: currentStats,
    skillMultiplier: usedSkillMult,
    description: isZeroBudget 
        ? `Direct Calculation (MV: ${baseStats.skillMultiplier || 2500}%)` 
        : `Theoretical Max (+${actualBudget} rolls)`
  };
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
      const finalStats = applyItemStats(baseStats, currentCombo);
      finalStats.skillMultiplier = baseStats.skillMultiplier;
      
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
  
  const formattedTopBuilds: BuildResult[] = topBuilds.map((b, idx) => {
    const setCounts: Record<string, number> = {};
    b.combo.forEach(i => setCounts[i.set] = (setCounts[i.set] || 0) + 1);
    const activeSets = Object.entries(setCounts)
        .filter(([_, count]) => count >= 2)
        .map(([name, count]) => `${count >= 4 ? 4 : 2} ${name}`)
        .join(' + ');

    return {
      rank: idx + 1,
      dps: b.dps,
      comboName: activeSets || "Mixed Set"
    };
  });

  return {
    dps: best.dps,
    stats: best.stats,
    combo: best.combo,
    skillMultiplier: usedSkillMult,
    topBuilds: formattedTopBuilds,
    description: `Best Build (Skill MV: ${mvDisplay}%)`
  };
};