import { BaseStats, DiscItem, EnemyStats, OptimizationResult } from '../types';
// Direct import to bypass Worker loading issues in this environment
import { runInventoryOptimizer, runTheoreticalOptimizer } from '../workers/optimizer.worker';

class OptimizerService {
  
  constructor() {
    console.log("OptimizerService initialized (Main Thread Mode)");
  }

  public calculateTheoretical(stats: BaseStats, enemy: EnemyStats, budget: number = 25): Promise<OptimizationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Pass the budget to the function
        const result = runTheoreticalOptimizer(stats, enemy, budget);
        resolve(result);
      }, 50);
    });
  }

  public optimizeInventory(stats: BaseStats, enemy: EnemyStats, inventory: DiscItem[]): Promise<OptimizationResult> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = runInventoryOptimizer(stats, enemy, inventory);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      }, 50);
    });
  }

  public terminate() {
    // No-op
  }
}

export const optimizerService = new OptimizerService();