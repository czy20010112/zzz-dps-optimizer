import { EngineData } from '../types';

export const ENGINES_DB: EngineData[] = [
  { 
    id: 'deep_sea', 
    name: { en: 'Deep Sea Visitor (S)', cn: '深海访客 (S)' },
    // Base: 713, Sub: 24% CR. Passive (R1): Ice DMG +25%, Crit Rate +20% (on skill/dash).
    stats: { atkBase: 713, critRate: 24 + 20, dmgBonus: 25 } 
  },
  { 
    id: 'brimstone', 
    name: { en: 'The Brimstone (S)', cn: '硫磺石 (S)' },
    // Base: 684, Sub: 30% ATK. Passive (R1): ATK +3.5% * 8 stacks = 28%.
    stats: { atkBase: 684, atkPercent: 30 + 28 } 
  },
  { 
    id: 'starlight', 
    name: { en: 'Starlight Engine (A)', cn: '星徽引擎 (A)' },
    // Base: 594, Sub: 24% ATK. Passive (R5): Quick Assist/Dodge -> ATK +19.2% (approx R5 value, or use R1 12% * scale)
    // Using R5 Max for simulation usually: ~19.2% -> Rounding to 20% for simplicity or strict R1=12%. Let's use R1: 12%.
    stats: { atkBase: 594, atkPercent: 24 + 12 } 
  },
  { 
    id: 'steam_oven', 
    name: { en: 'Steam Oven (A)', cn: '蒸汽烤箱 (A)' },
    // Base: 594, Sub: 16% Pen. Passive: Energy accum -> ATK stacks. Max ~20% ATK.
    stats: { atkBase: 594, penRatio: 16, atkPercent: 20 } 
  },
  {
    id: 'steel_cushion',
    name: { en: 'Steel Cushion (S)', cn: '钢铁肉垫 (S)' },
    // Base: 684, Sub: 24% CR. Passive: Phys DMG +20%, Back attack DMG +25%.
    stats: { atkBase: 684, critRate: 24, dmgBonus: 20 + 25 }
  },
  {
    id: 'restrained',
    name: { en: 'Restrained (S)', cn: '拘缚者 (S)' },
    // Base: 684, Sub: 12% Impact. Passive: Dmg +20% per stack from Basic Atk... approx.
    stats: { atkBase: 684, impact: 12, dmgBonus: 20 }
  },
  {
      id: 'cloud_mirage',
      name: { en: 'Cloud Mirage (1 Star)', cn: '云霓孤光 (1星)' },
      stats: {
          atkBase: 743,
          critDmg: 73,
          dmgBonus: 25,
          resReduction: 20
      }
  }
];