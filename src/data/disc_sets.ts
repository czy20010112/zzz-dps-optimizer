import { DiscSetData } from '../types';

export const DISC_SETS: DiscSetData[] = [
  { 
    id: 'Woodpecker', 
    name: { en: 'Woodpecker Electro', cn: '啄木鸟电音' },
    stats2pc: { critRate: 8 },
    // 4pc: Trigger crit -> 9% ATK (stackable). Simplified to 2 stacks (18%).
    stats4pc: { atkPercent: 18 }
  },
  { 
    id: 'Hormone', 
    name: { en: 'Hormone Punk', cn: '激素朋克' },
    stats2pc: { atkPercent: 10 },
    // 4pc: Switch/Enter combat -> 25% ATK for 10s.
    stats4pc: { atkPercent: 25 }
  },
  { 
    id: 'Puffer', 
    name: { en: 'Puffer Electro', cn: '河豚电音' },
    stats2pc: { penRatio: 8 },
    // 4pc: Ult DMG +20%, Launch Ult -> ATK +15%.
    stats4pc: { atkPercent: 15, dmgBonus: 20 }
  },
  { 
    id: 'Inferno', 
    name: { en: 'Inferno Metal', cn: '炎狱重金属' },
    stats2pc: { dmgBonus: 10 }, // Fire DMG
    // 4pc: +28% Crit Rate against Burning enemies.
    stats4pc: { critRate: 28 } 
  },
  {
    id: 'Thunder',
    name: { en: 'Thunder Metal', cn: '雷暴重金属' },
    stats2pc: { dmgBonus: 10 }, // Elec DMG
    // 4pc: +28% ATK when enemy is shocked
    stats4pc: { atkPercent: 28 }
  },
  {
    id: 'Polar',
    name: { en: 'Polar Metal', cn: '极地重金属' },
    stats2pc: { dmgBonus: 10 }, // Ice DMG
    // 4pc: +20% Basic/Dash Atk, +20% Freeze/Shatter DMG. Simplified to general Dmg for now.
    stats4pc: { dmgBonus: 20 }
  },
  {
    id: 'Chaos',
    name: { en: 'Chaos Jazz', cn: '混沌爵士' },
    stats2pc: { anomalyProficiency: 30 },
    // 4pc: Fire/Elec DMG +15%, off-field dmg +20%.
    stats4pc: { dmgBonus: 15 }
  },
  {
    id: 'Swing',
    name: { en: 'Swing Jazz', cn: '摇摆爵士' },
    stats2pc: { /* Energy Regen +20% (handled in logic/ignored for DPS) */ },
    // 4pc: Team DMG +15%.
    stats4pc: { dmgBonus: 15 }
  },
  {
    id: 'Fanged',
    name: { en: 'Fanged Metal', cn: '獠牙重金属' },
    stats2pc: { dmgBonus: 10 }, // Phys DMG
    // 4pc: Assault -> DMG +35%
    stats4pc: { dmgBonus: 35 }
  }
];