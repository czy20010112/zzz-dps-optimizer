import { AgentData, EngineData } from '../types';

export const AGENTS_DB: AgentData[] = [
  { 
    id: 'ellen', 
    name: { en: 'Ellen (Ice/Attack)', cn: '艾莲 (冰/强攻)' },
    stats: { atkBase: 944, critRate: 5, critDmg: 50, penRatio: 0 } 
  },
  { 
    id: 'zhuyuan', 
    name: { en: 'Zhu Yuan (Ether/Attack)', cn: '朱鸢 (以太/强攻)' },
    stats: { atkBase: 850, critRate: 5, critDmg: 50, penRatio: 0 } 
  },
  { 
    id: 's11', 
    name: { en: 'Soldier 11 (Fire/Attack)', cn: '11号 (火/强攻)' },
    stats: { atkBase: 880, critRate: 5, critDmg: 50, penRatio: 0 } 
  },
  { 
    id: 'anby', 
    name: { en: 'Anby (Elec/Stun)', cn: '安比 (电/击破)' },
    stats: { atkBase: 600, critRate: 5, critDmg: 50, penRatio: 0 } 
  },
  { 
    id: 'miyabi', 
    name: { en: 'Miyabi (Ice/Anomaly)', cn: '雅 (冰/异常)' },
    stats: { atkBase: 920, critRate: 5, critDmg: 50, penRatio: 0 } 
  },
];

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

export const DISC_SETS = [
  { id: 'Woodpecker', name: { en: 'Woodpecker Electro', cn: '啄木鸟电音' } },
  { id: 'Hormone', name: { en: 'Hormone Punk', cn: '激素朋克' } },
  { id: 'Puffer', name: { en: 'Puffer Electro', cn: '河豚电音' } },
  { id: 'Inferno', name: { en: 'Inferno Metal', cn: '炎狱重金属' } },
];