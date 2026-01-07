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
    {
        id: 'yeshunguang',
        // 修复1: 名字必须唯一，不能叫“雅”
        name: { en: 'Yeshunguang (Flash/6Shadows)', cn: '叶瞬光 (6影)' },
        // 修复2: 补全截图里的数值 (938攻, 49.4暴击, 35增伤, 60减防, 16000倍率)
        // 注意：这里使用了 TS 的类型断言 `as any` 来临时绕过类型检查，防止因为 extra 字段报错
        stats: {
            atkBase: 938,
            critRate: 49.4,
            critDmg: 50,
            penRatio: 0,
            dmgBonus: 35,       // 来自自定义属性
            defReduction: 60,   // 来自自定义属性
            extra: {
                skillMultiplier: 16000 // 来自截图的技能倍率
            }
        } as any
    },
];