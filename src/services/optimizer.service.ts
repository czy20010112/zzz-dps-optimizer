import { BaseStats, DiscItem, EnemyStats, OptimizationResult, TheoreticalConfig } from '../types';
// Direct import to bypass Worker loading issues in this environment
import { runInventoryOptimizer, runTheoreticalOptimizer } from '../workers/optimizer.worker';

class OptimizerService {
  
  constructor() {
    console.log("OptimizerService initialized (Main Thread Mode)");
  }

  public calculateTheoretical(
    stats: BaseStats, 
    enemy: EnemyStats, 
    budget: number = 25, 
    config?: TheoreticalConfig // Updated
  ): Promise<OptimizationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Pass the config to the worker function
        const result = runTheoreticalOptimizer(stats, enemy, budget, config);
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