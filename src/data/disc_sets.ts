
import { DiscSetData } from '../types';

export const DISC_SETS: DiscSetData[] = [
  { 
    id: 'Woodpecker', 
    name: { en: 'Woodpecker Electro', cn: '啄木鸟电音' },
    stats2pc: { critRate: 8 },
    stats4pc: { atkPercent: 18 } // Simplified 2 stacks
  },
  { 
    id: 'Hormone', 
    name: { en: 'Hormone Punk', cn: '激素朋克' },
    stats2pc: { atkPercent: 10 },
    stats4pc: { atkPercent: 25 }
  },
  { 
    id: 'Puffer', 
    name: { en: 'Puffer Electro', cn: '河豚电音' },
    stats2pc: { penRatio: 8 },
    stats4pc: { atkPercent: 15, dmgBonus: 20 }
  },
  { 
    id: 'Inferno', 
    name: { en: 'Inferno Metal', cn: '炎狱重金属' },
    stats2pc: { dmgBonus: 10 }, // Fire
    stats4pc: { critRate: 28 } 
  },
  {
    id: 'Thunder',
    name: { en: 'Thunder Metal', cn: '雷暴重金属' },
    stats2pc: { dmgBonus: 10 }, // Elec
    stats4pc: { atkPercent: 28 }
  },
  {
    id: 'Polar',
    name: { en: 'Polar Metal', cn: '极地重金属' },
    stats2pc: { dmgBonus: 10 }, // Ice
    stats4pc: { dmgBonus: 20 } // Simplified
  },
  {
    id: 'Chaos',
    name: { en: 'Chaos Jazz', cn: '混沌爵士' },
    stats2pc: { anomalyProficiency: 30 },
    stats4pc: { dmgBonus: 15 }
  },
  {
    id: 'Swing',
    name: { en: 'Swing Jazz', cn: '摇摆爵士' },
    stats2pc: { energy: 20 },
    stats4pc: { dmgBonus: 15 }
  },
  {
    id: 'Fanged',
    name: { en: 'Fanged Metal', cn: '獠牙重金属' },
    stats2pc: { dmgBonus: 10 }, // Phys
    stats4pc: { dmgBonus: 35 } // Assault -> DMG +35%
  },
  {
    id: 'Chaotic',
    name: { en: 'White Water Ballad', cn: '沧浪行歌' }, 
    stats2pc: { dmgBonus: 10 },
    stats4pc: { critRate: 20, atkPercent: 10 }
  },
  {
    id: 'Origami',
    name: { en: 'Origami Warrior', cn: '折枝剑歌' }, // Assuming localized name mapping
    stats2pc: { critDmg: 16 },
    stats4pc: { atkPercent: 0 } // Placeholder / Conditional text usually
  }
];
