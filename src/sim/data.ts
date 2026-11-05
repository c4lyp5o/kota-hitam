// Game data and pure helpers. No game state, no browser APIs.
export type BizType =
  | 'bola'
  | 'ekor'
  | 'smokes'
  | 'fakes'
  | 'den'
  | 'ahlong'
  | 'bar'
  | 'parlour'
  | 'chop'
  | 'powder'
  | 'casino'
  | 'front'
  | 'laundry';
export type Trait = 'honest' | 'sharp' | 'sticky' | 'talker' | 'tough';
export type PriceKey = 'cheap' | 'fair' | 'steep';

export interface BizDef {
  name: string;
  group: string;
  vice: boolean;
  cost: number;
  money: 'dirty' | 'clean';
  perDay: number;
  heat: number;
  slots: number;
  day: number;
  night: number;
  color: number;
  css: string;
  vert: string;
  horiz: string;
  blurb: string;
  respect?: number;
  launder?: number;
  rate?: number;
}

export const HOURS_PER_SEC = 24 / 30; // one in-game day = 30 s at 1×
export const START_DATE = Date.UTC(1987, 10, 2); // Monday 2 Nov 1987

export const BIZ: Record<BizType, BizDef> = {
  bola: {
    name: 'Bola betting shop',
    group: 'street',
    vice: true,
    cost: 900,
    money: 'dirty',
    perDay: 520,
    heat: 2,
    slots: 1,
    day: 0.9,
    night: 1.2,
    color: 0x2bff6a,
    css: '#1f9d48',
    vert: 'BOLA',
    horiz: 'BOLA · SPORTS CLUB',
    blurb: 'Football odds and runners. Cheap and quiet.',
  },
  ekor: {
    name: 'Ekor numbers',
    group: 'street',
    vice: true,
    cost: 700,
    money: 'dirty',
    perDay: 380,
    heat: 1.5,
    slots: 1,
    day: 1.1,
    night: 0.9,
    color: 0xf2ff3a,
    css: '#a9b01c',
    vert: '萬字',
    horiz: '4D · EKOR',
    blurb: 'Illegal four-digit lottery. Small bets, lots of them.',
  },
  smokes: {
    name: 'Contraband cigarettes',
    group: 'street',
    vice: true,
    cost: 800,
    money: 'dirty',
    perDay: 460,
    heat: 1.5,
    slots: 1,
    day: 1.1,
    night: 0.9,
    color: 0xff6420,
    css: '#c4511c',
    vert: '香煙',
    horiz: 'ROKOK MURAH',
    blurb: 'Duty-free cartons off the Thai border run.',
  },
  fakes: {
    name: 'Counterfeit stall',
    group: 'street',
    vice: true,
    cost: 1000,
    money: 'dirty',
    perDay: 540,
    heat: 1.5,
    slots: 1,
    day: 1.3,
    night: 0.6,
    color: 0x9b5cff,
    css: '#6f45c2',
    vert: '名牌',
    horiz: 'JAM · BEG · KASET',
    blurb: 'Fake watches, handbags and pirated cassettes.',
  },
  den: {
    name: 'Mahjong den',
    group: 'back',
    vice: true,
    cost: 1200,
    money: 'dirty',
    perDay: 700,
    heat: 2.5,
    slots: 2,
    day: 0.5,
    night: 1.5,
    color: 0xff2238,
    css: '#d81d33',
    vert: '麻將',
    horiz: '麻將 · MAHJONG',
    blurb: 'Tiles click till dawn. Steady money.',
  },
  ahlong: {
    name: 'Ah Long office',
    group: 'back',
    vice: true,
    cost: 1500,
    money: 'dirty',
    perDay: 820,
    heat: 3,
    slots: 2,
    day: 1.25,
    night: 0.7,
    color: 0xffb000,
    css: '#c98a0c',
    vert: '借錢',
    horiz: 'PINJAMAN WANG',
    blurb: 'Loans at 20% a week. Collections by day.',
  },
  bar: {
    name: 'Back-room bar',
    group: 'back',
    vice: true,
    cost: 1800,
    money: 'dirty',
    perDay: 1000,
    heat: 3.5,
    slots: 2,
    day: 0.4,
    night: 1.6,
    color: 0x2f8dff,
    css: '#2468c9',
    vert: '酒',
    horiz: 'BAR · ARAK · BIR',
    blurb: 'Smuggled liquor off the Port Klang lorries.',
  },
  parlour: {
    name: 'Massage parlour',
    group: 'back',
    vice: true,
    cost: 2600,
    money: 'dirty',
    perDay: 1400,
    heat: 5,
    slots: 3,
    day: 0.5,
    night: 1.5,
    color: 0xff79c6,
    css: '#c2508f',
    vert: '按摩',
    horiz: 'URUT · MASSAGE',
    blurb: 'Hostesses upstairs and a madam downstairs who keeps the books.',
    respect: 20,
  },
  chop: {
    name: 'Chop shop',
    group: 'big',
    vice: true,
    cost: 2200,
    money: 'dirty',
    perDay: 1150,
    heat: 4,
    slots: 2,
    day: 1.2,
    night: 0.8,
    color: 0xb6ff2a,
    css: '#6f9c16',
    vert: '車行',
    horiz: 'BENGKEL · KERETA',
    blurb: 'Stolen cars in, numbered parts out by morning.',
    respect: 15,
  },
  powder: {
    name: 'Powder room',
    group: 'big',
    vice: true,
    cost: 3000,
    money: 'dirty',
    perDay: 2000,
    heat: 8,
    slots: 2,
    day: 0.6,
    night: 1.4,
    color: 0xff2fd0,
    css: '#b51d93',
    vert: '藥材',
    horiz: 'KEDAI UBAT',
    blurb: 'A herbal shop in front. Something worse in back.',
    respect: 25,
  },
  casino: {
    name: 'Gambling hall',
    group: 'big',
    vice: true,
    cost: 4500,
    money: 'dirty',
    perDay: 2700,
    heat: 6,
    slots: 3,
    day: 0.4,
    night: 1.6,
    color: 0xffcf40,
    css: '#b8902a',
    vert: '賭場',
    horiz: 'KELAB · CASINO',
    blurb: 'Baccarat tables and a cashier cage. High rollers only.',
    respect: 40,
  },
  front: {
    name: 'Kopitiam front',
    group: 'front',
    vice: false,
    cost: 1200,
    money: 'clean',
    perDay: 180,
    heat: -2,
    slots: 1,
    day: 1.4,
    night: 0.5,
    color: 0xfff1cf,
    css: '#9a927f',
    vert: '茶室',
    horiz: 'KOPITIAM',
    blurb: 'Washes RM 900 of dirty cash a day at 80%.',
    launder: 900,
    rate: 0.8,
  },
  laundry: {
    name: 'Laundromat front',
    group: 'front',
    vice: false,
    cost: 3000,
    money: 'clean',
    perDay: 250,
    heat: -3,
    slots: 1,
    day: 1.3,
    night: 0.6,
    color: 0xbfe9ff,
    css: '#5f8ea3',
    vert: '洗衣',
    horiz: 'DOBI · LAUNDRY',
    blurb: 'Washes RM 1,800 a day at 85%. A laundry that launders.',
    launder: 1800,
    rate: 0.85,
    respect: 30,
  },
};
export const BIZ_ORDER = Object.keys(BIZ) as BizType[];
export const GROUPS = [
  ['street', 'Street rackets'],
  ['back', 'Back rooms'],
  ['big', 'Big money'],
  ['front', 'Fronts'],
];
export const RIVAL_TYPES: BizType[] = [
  'bola',
  'den',
  'bar',
  'ahlong',
  'ekor',
  'smokes',
  'fakes',
  'parlour',
];

export const TRAITS: Record<Trait, { label: string; wage: number; note: string }> = {
  honest: { label: 'Honest', wage: 60, note: 'Steady. No surprises.' },
  sharp: { label: 'Sharp', wage: 95, note: '+25% takings.' },
  sticky: { label: 'Sticky-fingered', wage: 40, note: 'Skims a quarter of the till.' },
  talker: { label: 'Talkative', wage: 50, note: '+60% heat from this place.' },
  tough: { label: 'Tough', wage: 80, note: 'Stops sabotage and arson here.' },
};
export const NAMES = [
  'Ah Keong',
  'Siti Aminah',
  'Ravi',
  'Ah Mui',
  'Faizal',
  'Kumar',
  'Mei Ling',
  'Zul',
  'Ah Pang',
  'Devi',
  'Lim Kok Wah',
  'Rosli',
  'Selvam',
  'Ah Beng',
  'Nora',
  'Jamal',
  'Kavitha',
  'Tan Ah Huat',
  'Azman',
  'Wei Jie',
  'Priya',
  'Hafiz',
  'Ah Choy',
  'Murugan',
  'Salmah',
  'Chin Fatt',
  'Ganesh',
  'Yati',
];

export const HEAT_LEVELS = ['Whispers', 'Patrols', 'Raids', 'Task force', 'Crackdown'];
export const PRICE: Record<PriceKey, { label: string; inc: number; share: number }> = {
  cheap: { label: 'Cheap', inc: 0.8, share: 1.25 },
  fair: { label: 'Fair', inc: 1, share: 1 },
  steep: { label: 'Steep', inc: 1.25, share: 0.8 },
};

export const BLOCKS: { c: [number, number]; name: string; blurb: string }[] = [
  {
    c: [-21, -21],
    name: 'Sentul',
    blurb: 'Railway yards and warehouses. Anything that comes by lorry ends up here.',
  },
  {
    c: [-7, -21],
    name: 'Titiwangsa',
    blurb: 'Lake Gardens on one side, quiet money on the other.',
  },
  {
    c: [7, -21],
    name: 'Jalan Pahang',
    blurb: 'Hospital traffic day and night, and doctors with gambling debts.',
  },
  {
    c: [21, -21],
    name: 'Kampung Baru North',
    blurb: 'Wooden village houses and a night market that never sleeps.',
  },
  { c: [-21, -7], name: 'Jalan Ipoh', blurb: 'Bus depots and mechanics. Cars go missing here.' },
  { c: [21, -7], name: 'Kampung Baru', blurb: 'Satay stalls, old families and long memories.' },
  { c: [-21, 7], name: 'Jalan TAR', blurb: 'Cloth shops by day, cabarets by night.' },
  {
    c: [21, 7],
    name: 'Jalan Raja Muda',
    blurb: 'Government quarters. Clerks with expensive habits.',
  },
  {
    c: [-21, 21],
    name: 'Masjid India',
    blurb: 'Textile merchants and money changers who ask no questions.',
  },
  {
    c: [-7, 21],
    name: 'Dang Wangi',
    blurb: 'The police district headquarters is two streets away. Bold.',
  },
  {
    c: [7, 21],
    name: 'Jalan Ampang',
    blurb: 'Embassy cars and bankers who like a quiet card game.',
  },
  {
    c: [21, 21],
    name: 'Bukit Bintang',
    blurb: "Where the real money drinks. Mat Botak's bosses have friends here.",
  },
];
export const CORE_BLOCKS: [number, number][] = [
  [-7, -7],
  [7, -7],
  [-7, 7],
  [7, 7],
];
export const LOT_COUNT = 16 + BLOCKS.length * 4;
export function blockOf(i: number) {
  return i < 16 ? -1 : Math.floor((i - 16) / 4);
}
export function lotAddress(i: number) {
  if (i >= 16) {
    const b = blockOf(i);
    return `Plot ${((i - 16) % 4) + 1}, ${BLOCKS[b].name}`;
  }
  const r = Math.floor(i / 4),
    c = i % 4;
  return [
    `No. ${c * 2 + 1}, Jalan Raja Alang`,
    `No. ${c * 2 + 1}, Jalan Raja Bot`,
    `No. ${c * 2 + 2}, Jalan Raja Bot`,
    `No. ${c * 2 + 2}, Lorong Haji Taib`,
  ][r];
}
export const WIN_LOTS = 10;
