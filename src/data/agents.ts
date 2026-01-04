import { AgentData } from '../types';

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