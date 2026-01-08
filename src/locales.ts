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
    'stat_atk_clean': 'ATK', // New clean label
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
    'parse': 'Parse&Load',
    'select_file': 'Select File',
    'add_custom': '+ Custom',
    'initiate_sim': 'INITIATE SIMULATION',
    'view_edit': 'VIEW / EDIT',
    
    // Modes
    'mode_theoretical': 'Theoretical',
    'mode_inventory': 'Inventory',
    'mode_raw': 'Raw / Direct',
    
    // Results
    'max_dps': 'THEORETICAL MAX DAMAGE',
    'effective_stats': 'EFFECTIVE STATS',
    'config': 'CONFIG',
    'skill_mult': 'Skill Multiplier',
    'rank': 'RANK',
    'damage': 'EXPECTED DAMAGE',
    'build': 'BUILD',
    
    // System Status
    'system_status_label': 'SYSTEM STATUS',
    'processing': 'PROCESSING...',
    'ready': 'READY',

    // Config
    'def_reduction': 'Def Shred + Ignore Def %',
    'res_reduction': 'Res Shred + Ignore Res %',

    // Intro
    'intro_clickable_note': 'Calculation result numbers are clickable to view detailed Formula and Build breakdowns.',
  },
  cn: {
    // Labels
    'agent': '代理人',
    'w_engine': '音擎',
    'base_atk': '基础攻击',
    'flat_atk': '固定攻击',
    'atk_percent': '攻击力百分比',
    'dmg_bonus': '属性伤害加成（增伤也在这）',
    'crit_rate': '暴击率',
    'crit_dmg': '暴击伤害',
    'pen_flat': '固定穿透',
    'pen_ratio': '穿透率',
    'enemy_level': '敌人等级',
    'enemy_def': '敌人防御',
    'resistance': '敌人抗性',
    'target_stunned': '击破状态',
    'stun_mult': '击破易伤倍率',
    'substat_budget': '副词条数量限制',

    'set_bonuses': '套装效果',
    'slot_4': '4号位',
    'slot_5': '5号位',
    'slot_6': '6号位',
    'main_stat_fixed': '已包含固定主属性 (1-3号位)',
    'main_stat_selected': '所选主属性 (4-6号位)',
    'incl_slot_2': '包含2号位固定攻击',

    'final_atk': '最终攻击力 (面板)',
    'final_crit_rate': '最终暴击率 (面板)',
    'final_crit_dmg': '最终暴击伤害 (面板)',
    'final_pen': '最终固定穿透 (面板)',
    'panel_stats': '最终面板',

    // Stats
    'stat_atk': '小攻击',
    'stat_atkFlat': '小攻击',
    'stat_atk_': '攻击力 %',
    'stat_atkPercent': '攻击力 （%）',
    'stat_atk_clean': '攻击力', // Clean label
    'stat_def': '防御力',
    'stat_def_': '防御力 %',
    'stat_hp': '生命值',
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
    'stat_anomaly': '异常掌控',
    'stat_anomalyProficiency': '异常掌控',
    'stat_resReduction': '抗性降低',
    'stat_defReduction': '减防/无视防御',

    // Titles
    'agent_specs': '代理人配置',
    'target_analysis': '敌人数据',
    'disk_storage': '驱动盘仓库',
    'manual_input': '手动录入',
    'import_json': '导入 JSON',
    'custom_data': '自定义数据',
    'select_set': '选择套装模板...',
    'set_name': '套装名称',
    '2pc_effect': '2件套效果',
    '4pc_effect': '4件套效果',
    'add_stat': '添加词条',
    'save_data': '保存数据',
    'template_mode': '模板模式：保存将创建新条目。',
    'formula_desc': '最终伤害 = 攻击区 x 倍率区 x 双暴区 x 增伤区 x 防御区 x 抗性区 x 失衡区',
    'effective_def': '有效防御',
    'dmg_reduction': '减伤率',
    'formula_equation': '系数 / (防御 * (1-穿透率) * (1-减防) - 固定穿透 + 系数)',

    // Buttons
    'import': '导入 JSON',
    'export': '导出 JSON',
    'purge': '清空所有',
    'add_disk': '添加驱动盘',
    'cancel': '取消',
    'confirm': '确认',
    'parse': '解析并加载',
    'select_file': '选择文件',
    'add_custom': '+ 自定义',
    'initiate_sim': '开始计算',
    'view_edit': '查看 / 编辑',

    // Modes
    'mode_theoretical': '理论计算',
    'mode_inventory': '库存模拟',
    'mode_raw': '直伤计算',

    // Results
    'max_dps': '理论最高期望伤害',
    'effective_stats': '生效属性',
    'config': '配置详情',
    'skill_mult': '技能倍率',
    'rank': '排名',
    'damage': '期望伤害',
    'build': '配装',

    // System Status
    'system_status_label': '系统状态',
    'processing': '计算中...',
    'ready': '就绪',

    // Config
    'def_reduction': '防御降低+无视防御 %',
    'res_reduction': '抗性降低+无视抗性 %',

    // Intro
    'intro_clickable_note': '计算结果数字可点击，以查看详细的伤害乘区和配装详情。',
  }
};

const LanguageContext = createContext<any>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('cn'); // Set default to 'cn'

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'cn' : 'en'));
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, toggleLang, t } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);