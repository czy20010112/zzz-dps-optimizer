import { EngineData } from '../types';

export const ENGINES_DB: EngineData[] = [
  { 
    id: 'deep_sea', 
    name: { en: 'Deep Sea Visitor (S)', cn: '深海访客 (S)' },
    stats: { atkBase: 713, critRate: 24 } 
  },
  { 
    id: 'brimstone', 
    name: { en: 'The Brimstone (S)', cn: '硫磺石 (S)' },
    stats: { atkBase: 684, atkPercent: 30 } 
  },
  { 
    id: 'starlight', 
    name: { en: 'Starlight Engine (A)', cn: '星徽引擎 (A)' },
    stats: { atkBase: 594, atkPercent: 24 } 
  },
  { 
    id: 'steam_oven', 
    name: { en: 'Steam Oven (A)', cn: '蒸汽烤箱 (A)' },
    stats: { atkBase: 594, penRatio: 16 } 
  },
];