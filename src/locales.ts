
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'cn';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    // Labels
    'agent': 'Agent',
    'w_engine': 'W-Engine',
    'base_atk': 'Base ATK',
    'flat_atk': 'Flat ATK (+)',
    'atk_percent': 'ATK %',
    'dmg_bonus': 'DMG Bonus %',
    'crit_rate': 'Crit Rate %',
    'crit_dmg': 'Crit DMG %',
    'pen_flat': 'Pen (Flat)',
    'pen_ratio': 'Pen Ratio %',
    'enemy_level': 'Enemy Level',
    'enemy_def': 'Enemy DEF',
    'resistance': 'Resistance %',
    'target_stunned': 'Target Stunned',
    'stun_mult': 'Stun Mult. %',
    'substat_budget': 'Substat Budget (Rolls)',
    
    // New Keys Task 2
    'set_bonuses': 'SET BONUSES',
    'slot_4': 'IV (4)',
    'slot_5': 'V (5)',
    'slot_6': 'VI (6)',
    'main_stat_fixed': 'Includes Fixed Main Stats (Slot 1-3)',
    'main_stat_selected': 'Selected (Slot 4-6)',
    'incl_slot_2': 'Incl. Slot 2 + Main',

    // Raw Mode Labels
    'final_atk': 'Final ATK',
    'final_crit_rate': 'Final Crit Rate %',
    'final_crit_dmg': 'Final Crit DMG %',
    'final_pen': 'Final Pen (Flat)',
    'panel_stats': 'PANEL STATS // MANUAL',
    
    // Stats
    'stat_atk': 'ATK (Flat)',
    'stat_atkFlat': 'ATK (Flat)',
    'stat_atk_': 'ATK %',
    'stat_atkPercent': 'ATK %',
    'stat_def': 'DEF (Flat)',
    'stat_def_': 'DEF %',
    'stat_hp': 'HP (Flat)',
    'stat_hp_': 'HP %',
    'stat_critRate': 'Crit Rate',
    'stat_critDmg': 'Crit DMG',
    'stat_pen': 'Pen (Flat)',
    'stat_penFlat': 'Pen (Flat)',
    'stat_pen_': 'Pen Ratio',
    'stat_penRatio': 'Pen Ratio',
    'stat_elemental': 'Elem. DMG',
    'stat_dmgBonus': 'Elem. DMG',
    'stat_impact': 'Impact',
    'stat_mastery': 'Mastery',
    'stat_anomalyMastery': 'Mastery',
    'stat_energy': 'Energy Regen',
    'stat_anomaly': 'Anomaly Prof.',
    'stat_anomalyProficiency': 'Anomaly Prof.',
    'stat_resReduction': 'Res Shred',
    'stat_defReduction': 'Def Shred',

    // Titles
    'agent_specs': 'Agent Specs // WORKSHOP',
    'target_analysis': 'Target Analysis // BATTLEFIELD',
    'disk_storage': 'Disk Storage // INVENTORY',
    'manual_input': 'Manual Input',
    'import_json': 'Import JSON',
    'custom_data': 'Custom Data',
    'select_set': 'Select Set Template...',
    'set_name': 'Set Name',
    '2pc_effect': '2-Piece Effect',
    '4pc_effect': '4-Piece Effect',
    'add_stat': 'ADD STAT',
    'save_data': 'SAVE DATA',
    'template_mode': 'TEMPLATE MODE: Saving creates a new entry.',
    'formula_desc': 'Damage = Atk Area x Motion Value x Crit Area x Dmg Bonus x Def Area x Res Area x Stun Area',
    'effective_def': 'Effective Def',
    'dmg_reduction': 'Dmg Red.',
    'formula_equation': 'Coeff / (Def * (1-Pen%) * (1-Shred%) - PenFlat + Coeff)',

    // Buttons
    'import': 'Import JSON',
    'export': 'Export JSON',
    'purge': 'Purge All',
    'add_disk': 'Add Disc',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'parse': 'Parse & Load',
    'add_custom': '+ Custom',
    'initiate_sim': 'INITIATE SIMULATION',
    'view_edit': 'VIEW / EDIT',
    
    // Modes
    'mode_theoretical': 'Theoretical',
    'mode_inventory': 'Inventory',
    'mode_raw': 'Raw / Direct',
    
    // Results
    'max_dps': 'THEORETICAL MAX DPS',
    'effective_stats': 'EFFECTIVE STATS',
    'config': 'CONFIG',
    'skill_mult': 'Skill Multiplier',
    'rank': 'RANK',
    'damage': 'DAMAGE',
    'build': 'BUILD',
  },
  cn: {
    // Labels
    'agent': '代理人 (Agent)',
    'w_engine': '音擎 (W-Engine)',
    'base_atk': '基础攻击 (Base ATK)',
    'flat_atk': '小攻击 (Flat ATK)',
    'atk_percent': '攻击力 %',
    'dmg_bonus': '伤害加成 %',
    'crit_rate': '暴击率 %',
    'crit_dmg': '暴击伤害 %',
    'pen_flat': '穿透值 (Flat)',
    'pen_ratio': '穿透率 %',
    'enemy_level': '敌人等级',
    'enemy_def': '敌人防御',
    'resistance': '属性抗性 %',
    'target_stunned': '处于失衡状态',
    'stun_mult': '失衡倍率 %',
    'substat_budget': '副词条预算 (词条数)',

    // New Keys Task 2
    'set_bonuses': '套装效果',
    'slot_4': 'IV (4号位)',
    'slot_5': 'V (5号位)',
    'slot_6': 'VI (6号位)',
    'main_stat_fixed': '已包含固定主属性 (1-3号位)',
    'main_stat_selected': '自选主属性 (4-6号位)',
    'incl_slot_2': '包含 2号位 + 自选主词条',

    // Raw Mode Labels
    'final_atk': '最终攻击力 (Final ATK)',
    'final_crit_rate': '最终暴击率 %',
    'final_crit_dmg': '最终暴击伤害 %',
    'final_pen': '最终穿透值 (Flat)',
    'panel_stats': '面板数据 // PANEL STATS',

    // Stats
    'stat_atk': '固定攻击',
    'stat_atkFlat': '固定攻击',
    'stat_atk_': '攻击力 %',
    'stat_atkPercent': '攻击力 %',
    'stat_def': '固定防御',
    'stat_def_': '防御力 %',
    'stat_hp': '固定生命',
    'stat_hp_': '生命值 %',
    'stat_critRate': '暴击率',
    'stat_critDmg': '暴击伤害',
    'stat_pen': '穿透值',
    'stat_penFlat': '穿透值',
    'stat_pen_': '穿透率',
    'stat_penRatio': '穿透率',
    'stat_elemental': '属性伤害',
    'stat_dmgBonus': '属性伤害',
    'stat_impact': '冲击力',
    'stat_mastery': '异常精通',
    'stat_anomalyMastery': '异常精通',
    'stat_energy': '能量自动回复',
    'stat_anomaly': '异常精通',
    'stat_anomalyProficiency': '异常精通',
    'stat_resReduction': '抗性降低',
    'stat_defReduction': '防御降低',

    // Titles
    'agent_specs': '代理人规格 // 改装工坊',
    'target_analysis': '目标分析 // 战斗环境',
    'disk_storage': '驱动盘库存 // STORAGE',
    'manual_input': '手动录入',
    'import_json': '导入 JSON',
    'custom_data': '自定义数据',
    'select_set': '选择套装模板...',
    'set_name': '套装名称',
    '2pc_effect': '2件套效果',
    '4pc_effect': '4件套效果',
    'add_stat': '添加属性',
    'save_data': '保存数据',
    'template_mode': '模板模式：保存将创建新的自定义条目',
    'formula_desc': '伤害 = 攻击区 × 倍率区 × 双暴区 × 增伤区 × 防御区 × 抗性区 × 失衡区',
    'effective_def': '有效防御',
    'dmg_reduction': '减伤',
    'formula_equation': '系数 / (防御 * (1-穿透) * (1-减防) - 固定穿透 + 系数)',

    // Buttons
    'import': '导入数据',
    'export': '导出数据',
    'purge': '清空库存',
    'add_disk': '添加驱动盘',
    'cancel': '取消',
    'confirm': '确认',
    'parse': '解析并加载',
    'add_custom': '+ 自定义',
    'initiate_sim': '开始代理',
    'view_edit': '查看 / 编辑',

    // Modes
    'mode_theoretical': '理论计算',
    'mode_inventory': '库存模拟',
    'mode_raw': '直伤计算',
    
    // Results
    'max_dps': '理论最高期望 (MAX DPS)',
    'effective_stats': '最终面板',
    'config': '配置详情',
    'skill_mult': '技能倍率',
    'rank': '排名',
    'damage': '期望伤害',
    'build': '配装方案',
  }
};

// --- Context ---

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('cn'); 

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'cn' : 'en');
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return React.createElement(LanguageContext.Provider, { value: { lang, toggleLang, t } }, children);
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
