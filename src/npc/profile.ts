// Who a bystander is: name, job, temper, ties to the underworld and one secret. No rendering.
import type { Rng } from '../sim/rng';

export type Gender = 'm' | 'f';
export type Side = 'you' | 'rival';
export type CommunityKey = 'malay' | 'chinese' | 'indian' | 'eurasian';

export interface Community {
  w: number;
  m: string[];
  f: string[];
  sur?: string[];
  elder: Record<Gender, string>;
  name(g: Gender, given: string, sur: string): string;
}
export interface JobDef {
  job: string;
  outfit?: string[];
  acc?: string[];
  age: [number, number];
  lines: string[];
  g?: Gender;
  hat?: string;
  tie?: string;
  build?: number;
}
export interface ProfileOverrides {
  job?: string;
  gender?: Gender;
  community?: CommunityKey;
  age?: number;
  outfit?: string;
  hat?: string;
  temper?: string;
  acc?: string | null;
  umbrella?: boolean;
  secret?: (typeof SECRETS)[number];
}
export type Profile = ReturnType<typeof generateProfile>;

export const COMMUNITIES: Record<CommunityKey, Community> = {
  malay: {
    w: 4,
    m: [
      'Ahmad',
      'Zainal',
      'Kassim',
      'Rosli',
      'Hafiz',
      'Azman',
      'Bakar',
      'Jamal',
      'Faizal',
      'Hassan',
      'Ismail',
      'Razak',
      'Khalid',
      'Osman',
    ],
    f: [
      'Rosnah',
      'Siti',
      'Salmah',
      'Nora',
      'Aminah',
      'Zaleha',
      'Yati',
      'Fatimah',
      'Rohani',
      'Nadia',
      'Habibah',
      'Ramlah',
    ],
    elder: { m: 'Pak ', f: 'Mak Cik ' },
    name: (g, given) => given,
  },
  chinese: {
    w: 4,
    m: [
      'Ah Seng',
      'Kok Wah',
      'Ah Huat',
      'Ah Fook',
      'Kee',
      'Beng',
      'Chong',
      'Ah Boy',
      'Kevin',
      'Danny',
      'Jimmy',
      'Ah Pang',
      'Swee Leong',
    ],
    f: [
      'Mei Ling',
      'Ah Mui',
      'Lily',
      'Siew Lan',
      'Pauline',
      'Moon',
      'Jenny',
      'Ah Lian',
      'Swee Kim',
      'Ah Ngoh',
    ],
    sur: ['Tan', 'Lim', 'Wong', 'Lee', 'Chan', 'Ng', 'Ong', 'Chua', 'Loh', 'Yap', 'Teoh'],
    elder: { m: 'Uncle ', f: 'Auntie ' },
    name: (g, given, sur) =>
      /^Ah /.test(given)
        ? given
        : /^(Kevin|Danny|Jimmy|Lily|Pauline|Moon|Jenny)$/.test(given)
          ? `${given} ${sur}`
          : `${sur} ${given}`,
  },
  indian: {
    w: 3,
    m: [
      'Ravi',
      'Kumar',
      'Selvam',
      'Murugan',
      'Raju',
      'Ganesh',
      'Arumugam',
      'Suresh',
      'Bala',
      'Krishnan',
    ],
    f: ['Meena', 'Devi', 'Kavitha', 'Priya', 'Rani', 'Lakshmi', 'Shanti', 'Vasanthi'],
    elder: { m: 'Uncle ', f: 'Aunty ' },
    name: (g, given) => given,
  },
  eurasian: {
    w: 1,
    m: ['Victor', 'Joseph', 'Anthony', 'Gerald'],
    f: ['Agnes', 'Rosalind', 'Maria', 'Theresa'],
    sur: ['de Souza', 'Pereira', "D'Cruz", 'Rodrigues'],
    elder: { m: 'Mr ', f: 'Mrs ' },
    name: (g, given, sur) => `${given} ${sur}`,
  },
};
export const SKIN = [0xf1d0b0, 0xe6bf98, 0xd4a57c, 0xb98560, 0x9a6844, 0x7a4f32];
export const SKIN_BY: Record<CommunityKey, number[]> = {
  malay: [2, 3, 4],
  chinese: [0, 1, 2],
  indian: [3, 4, 5],
  eurasian: [1, 2, 3],
};
export const CLOTH = [
  0x2b2d33, 0x6a3a3a, 0x3a4a6a, 0x7a6a4a, 0x2f5a4a, 0x5a3a6a, 0xb8b2a4, 0x8a2f2f, 0x2f4f7a,
  0x6b5a2f, 0xd9cdb0, 0x45464c,
];
export const BRIGHT = [
  0xc8322f, 0x2f6fb5, 0xd9a93a, 0x3f7d4a, 0xc94a8c, 0x7a52c9, 0xe07b39, 0x2aa59a,
];

export const JOBS: JobDef[] = [
  {
    job: 'kuih seller',
    outfit: ['kurung', 'sarong', 'apron'],
    acc: ['basket'],
    age: [30, 70],
    lines: [
      'Kuih lapis, twenty sen. The boys from the den buy the whole tray at dawn.',
      "My kuih is sold out by ten. The gamblers eat like they'll never eat again.",
    ],
  },
  {
    job: 'trishaw rider',
    g: 'm',
    outfit: ['singlet', 'shirt'],
    hat: 'cap',
    age: [35, 75],
    lines: [
      "Fares are thin when it rains. Gamblers tip, though, when they've won.",
      'Thirty years pedalling this street. My knees know every pothole.',
    ],
  },
  {
    job: 'off-duty policeman',
    g: 'm',
    outfit: ['shirt', 'jacket'],
    acc: ['newspaper'],
    age: [28, 50],
    tie: 'police',
    lines: [
      "My sergeant drives a new Volvo. On a sergeant's pay.",
      'Everyone on this street knows my face. Nobody says good evening.',
    ],
  },
  {
    job: 'beat constable',
    g: 'm',
    outfit: ['police'],
    hat: 'police',
    age: [22, 40],
    tie: 'police',
    lines: [
      "Walk the beat, write nothing down, go home. That's the job here.",
      'The inspector says Chow Kit is under control. The inspector has never walked it at night.',
    ],
  },
  {
    job: 'night-shift nurse',
    g: 'f',
    outfit: ['nurse'],
    hat: 'nurse',
    age: [22, 45],
    lines: [
      'Third stab wound this month at the General. Nobody ever saw anything.',
      "I stitch up Geng Lorong boys on Monday and the red outfit's boys on Tuesday.",
    ],
  },
  {
    job: 'retired goldsmith',
    outfit: ['shirt'],
    age: [62, 82],
    lines: [
      'Forty years on this street. The neon gets brighter and the people get poorer.',
      "Gold doesn't lie. Everything else on this street does.",
    ],
  },
  {
    job: 'bus conductor',
    outfit: ['shirt'],
    acc: ['bag'],
    age: [22, 55],
    lines: [
      'Last bus to Sentul at eleven. Half the passengers smell of arak.',
      'Ticket, ticket. Nobody on the night bus ever has the right change.',
    ],
  },
  {
    job: 'factory worker',
    outfit: ['kurung', 'shirt', 'dress'],
    age: [18, 30],
    lines: [
      'Ten hours soldering radios in Shah Alam, then the bus home.',
      'The supervisor says the factory might move to Penang. Then what?',
    ],
  },
  {
    job: 'reporter at Warta Malam',
    outfit: ['jacket', 'office'],
    acc: ['newspaper'],
    hat: 'fedora',
    age: [25, 55],
    lines: [
      "There's a story on this street. My editor says it isn't worth a funeral.",
      'Two gangs, one street. Somebody always talks eventually.',
    ],
  },
  {
    job: 'newspaper vendor',
    outfit: ['singlet', 'shirt'],
    acc: ['newspaper'],
    age: [40, 75],
    lines: [
      "Warta Malam sells out whenever there's a fire.",
      'Bad news sells. Good news, I use to wrap fish.',
    ],
  },
  {
    job: 'insurance salesman',
    outfit: ['office'],
    acc: ['briefcase'],
    age: [25, 55],
    lines: [
      'Fire insurance is a hard sell here. Everyone knows how the fires start.',
      'Life insurance? On this street? I should sell umbrellas instead.',
    ],
  },
  {
    job: 'night watchman',
    g: 'm',
    outfit: ['shirt'],
    age: [45, 72],
    lines: [
      'I guard a warehouse full of nothing. They pay me not to see the lorries.',
      'Night watchman. The night never asks me to watch anything good.',
    ],
  },
  {
    job: 'flower seller',
    outfit: ['kurung', 'saree', 'shirt'],
    acc: ['basket'],
    age: [30, 70],
    lines: [
      'Jasmine for the temple, roses for the hostesses. Same price.',
      "Men buy flowers when they've lost at mahjong. Guilt is good business.",
    ],
  },
  {
    job: 'char kway teow hawker',
    outfit: ['singlet', 'apron'],
    age: [35, 70],
    lines: [
      'Wok hei and rain. My stall has stood here longer than any gang.',
      'Geng Lorong eats free. The new outfit pays. I notice these things.',
    ],
  },
  {
    job: 'bar singer',
    g: 'f',
    outfit: ['cheongsam', 'saree', 'dress'],
    age: [22, 45],
    lines: [
      'They always ask for "Bengawan Solo" when it rains.',
      "I sing for drunks who think they're in love. Some nights I believe them.",
    ],
  },
  {
    job: 'lorry driver',
    g: 'm',
    outfit: ['singlet', 'shirt'],
    hat: 'cap',
    age: [25, 60],
    lines: [
      "Port Klang at four, Chow Kit by six. I don't open the back. I don't want to know.",
      "Every load has two prices: what's on the paper and what's in the crate.",
    ],
  },
  {
    job: 'dance-hall hostess',
    g: 'f',
    outfit: ['cheongsam', 'dress'],
    age: [20, 35],
    lines: [
      'Ten cents a dance, and the men still count the change.',
      'The madam says smile. I smile. The rent gets paid.',
    ],
  },
  {
    job: 'municipal inspector',
    outfit: ['office'],
    acc: ['briefcase'],
    age: [30, 58],
    lines: [
      'Licence or no licence, an envelope settles both.',
      "I inspect what I'm paid to inspect. Nothing else.",
    ],
  },
  {
    job: 'temple caretaker',
    age: [55, 82],
    outfit: ['shirt', 'kurung', 'saree'],
    lines: [
      'More joss sticks lit this month than last. People are praying for luck.',
      'The gods hear everything on this street. They keep it to themselves.',
    ],
  },
  {
    job: 'college student',
    outfit: ['shirt', 'dress'],
    acc: ['books'],
    age: [18, 24],
    lines: [
      "Exams in two weeks and I'm walking past a gambling den at midnight.",
      "My lecturer says Malaysia will be an industrial nation. Chow Kit hasn't heard.",
    ],
  },
  {
    job: 'seamstress',
    g: 'f',
    outfit: ['kurung', 'saree', 'cheongsam'],
    age: [25, 65],
    lines: [
      'I hem trousers for gangsters. They tip well and never say thank you.',
      'Every hostess on this street wears my dresses. I know all their sizes, and their secrets.',
    ],
  },
  {
    job: 'fortune teller',
    outfit: ['shirt', 'kurung'],
    age: [50, 82],
    lines: [
      'I tell them the cards say luck is coming. The cards never say from where.',
      'Everyone wants to know their future. Nobody on this street wants to hear it.',
    ],
  },
  {
    job: 'ex-boxer',
    g: 'm',
    outfit: ['singlet'],
    age: [30, 55],
    build: 1.25,
    lines: [
      "Mat Botak offered me work. I said I had bad knees. I don't.",
      "I can still take a punch. It's the rent I can't take.",
    ],
  },
  {
    job: 'telephone operator',
    g: 'f',
    outfit: ['dress', 'kurung'],
    age: [20, 40],
    lines: [
      "I connect the calls and forget the voices. That's the rule.",
      'A man called the station from a kopitiam last week and hung up before giving his name.',
    ],
  },
  {
    job: 'bicycle repairman',
    g: 'm',
    outfit: ['singlet'],
    age: [30, 70],
    lines: [
      "Kids from Geng Lorong bring stolen bicycles. I don't ask.",
      "Spokes and chains. Simple things that do what they're meant to.",
    ],
  },
  {
    job: 'taxi driver',
    g: 'm',
    outfit: ['shirt'],
    hat: 'cap',
    age: [28, 65],
    lines: [
      'A Datuk paid me fifty to wait outside the gambling hall. I waited.',
      'Fares from Chow Kit to Bukit Bintang. Same men, different shirts.',
    ],
  },
  {
    job: 'schoolteacher',
    outfit: ['office', 'kurung', 'saree'],
    acc: ['books'],
    age: [25, 60],
    lines: [
      'Half my class wants to be bola runners. The other half already are.',
      'I teach them arithmetic. The Ah Long teaches them interest.',
    ],
  },
  {
    job: 'cinema projectionist',
    g: 'm',
    outfit: ['shirt'],
    age: [25, 60],
    lines: [
      'P. Ramlee at seven, kung fu at nine. The rats prefer kung fu.',
      'I watch the films backwards through a little window. Life looks better that way.',
    ],
  },
  {
    job: 'barber',
    g: 'm',
    outfit: ['shirt', 'apron'],
    age: [30, 70],
    lines: [
      "Everyone talks in the barber's chair. Even Mat Botak.",
      'A shave and a rumour, two ringgit.',
    ],
  },
  {
    job: 'office clerk',
    outfit: ['office'],
    acc: ['briefcase'],
    age: [22, 50],
    lines: [
      'Eight to five in a government office, then the dance hall till midnight.',
      'I file papers about land in Kampung Baru. Somebody keeps buying it.',
    ],
  },
  {
    job: 'collector for an Ah Long',
    g: 'm',
    outfit: ['jacket', 'shirt'],
    age: [22, 45],
    tie: 'ahlong',
    lines: [
      "I knock, they pay. If they don't, I knock harder. It's just a job.",
      'My mother thinks I work in insurance. In a way, I do.',
    ],
  },
  {
    job: 'mahjong dealer',
    outfit: ['shirt', 'cheongsam'],
    age: [25, 60],
    tie: 'den',
    lines: [
      'I shuffle tiles till my wrists ache. The house always wins; I just work for the house.',
      'Good players never smile. Bad players never stop.',
    ],
  },
  {
    job: 'bola runner',
    g: 'm',
    outfit: ['shirt', 'singlet'],
    age: [18, 35],
    tie: 'bola',
    lines: [
      'Slips in my left pocket, cash in my right. Never mix them up.',
      'Selangor lost again. Half the street owes the book now.',
    ],
  },
];

export const TEMPERS = {
  weary: {
    label: 'Weary',
    lines: [
      'Another night, another wet pair of shoes.',
      "I'm too tired to be afraid of anything anymore.",
      'The rain sounds like applause for nobody.',
    ],
    you: 'Another boss, another set of rules. They all end the same.',
    rival: "Geng Lorong again. I don't even look up anymore.",
  },
  cynical: {
    label: 'Cynical',
    lines: [
      'Everybody on this street is selling something. Mostly themselves.',
      'The police, the gangs, the council. Same envelope, different hands.',
      'Hope is a ringgit you never get back.',
    ],
    you: "The new boss pays the old men's coffee tabs. Buying a street one kopi at a time.",
    rival: 'Mat Botak calls it protection. Protection from Mat Botak.',
  },
  hopeful: {
    label: 'Hopeful',
    lines: [
      "One good month and I'm out of here.",
      'The rain stops eventually. It has to.',
      'Somebody told me the government is building towers by the racecourse. Jobs, maybe.',
    ],
    you: 'They say the red outfit pays fair. Maybe things are changing.',
    rival: "Geng Lorong can't last forever. Nobody does.",
  },
  nervous: {
    label: 'Nervous',
    lines: [
      "Is that man following me? He's been behind me since the market.",
      "Walk faster. Don't look at the doorways.",
      'I should have taken the bus.',
    ],
    you: "Red signs mean the new outfit. Keep your head down, they're friendly until they're not.",
    rival: "Teal light. Geng Lorong. Don't look, don't look, don't look.",
  },
  bitter: {
    label: 'Bitter',
    lines: [
      "This street took my father's shop and gave it to a gangster.",
      'Everyone got rich in the seventies except me.',
      'My brother left for Singapore. Smart man. Cruel man.',
    ],
    you: 'The boss from Ipoh. Another outsider buying what we built.',
    rival: 'Mat Botak was a nobody in my school. Now he owns my old street.',
  },
  romantic: {
    label: 'Romantic',
    lines: [
      'Neon in the puddles. You could almost call it pretty.',
      "Somebody's radio is playing Sudirman through an open window.",
      'I met her on this corner, under that awning. She married a dentist.',
    ],
    you: "There's something about the red neon. Like a film.",
    rival: "Even Geng Lorong's doors look beautiful in the rain. Dangerous things usually do.",
  },
  nosy: {
    label: 'Nosy',
    lines: [
      "Mrs Chan's husband came home at four again. Dance hall, definitely.",
      "Two cars outside the gambling hall I've never seen before. Who are they?",
      'I know who owes who on this street. Better than any ledger.',
    ],
    you: 'I saw the boss from Ipoh himself last week. Smaller than I thought.',
    rival: 'Mat Botak bought a new Mercedes. Paid cash, they say.',
  },
  proud: {
    label: 'Proud',
    lines: [
      'My family has lived on this street since before Merdeka.',
      "I don't bow to gangsters. I just don't make eye contact.",
      'Clean shoes, clean shirt, clean conscience. Two out of three.',
    ],
    you: "The new boss keeps the drunks off my doorstep. I'll give him that much.",
    rival: 'Geng Lorong spits on the five-foot way. No respect.',
  },
};
export const HOPES = [
  'to save enough for a shophouse of my own',
  'to send my son to university in England',
  'to go back to my village with money in my pocket',
  'to see the sea at Port Dickson again',
  'to buy a Honda Cub before the year ends',
  'to get out of Chow Kit before it gets me',
  'to sing at the Merlin Hotel one day',
  "to pay off my father's debts",
  'to have a kitchen with a refrigerator',
  'to marry before my mother gives up asking',
  'to open a stall at the new Central Market',
];
export const FEARS = [
  'the Ah Long knocking on my door',
  'losing my job when the factory moves',
  'my son running with Geng Lorong',
  'the police finding out about my cousin',
  'getting old alone in a rented room',
  'fire, ever since the shophouse on Lorong Haji Taib burned',
  'that my wife already knows',
  'the landlord selling to a gangster',
  'another raid on the street, with me caught in it',
];
export const KIN = [
  'My wife',
  'My mother',
  'My daughter',
  'My brother',
  'My husband',
  'My son',
  'My landlady',
  'My father',
];
export const KIN_LINES = [
  "{kin} thinks I'm working late.",
  '{kin} wants me to leave Chow Kit. {kin} is probably right.',
  "{kin} hasn't spoken to me since Raya.",
  '{kin} keeps our savings in a Milo tin under the bed.',
  '{kin} says the rain is a sign. Of what, nobody knows.',
];

export const SECRETS = [
  {
    text: "I saw Mat Botak's runners loading petrol cans into a van behind the bola shop. They're planning something for the end of the week.",
    fx: 'delay',
    note: "Forewarned: Geng Lorong's next move is delayed by a day.",
  },
  {
    text: "The station chief's driver drinks at the back-room bar on Thursdays. He talks when he drinks, and he'll stop talking if somebody buys his rounds.",
    fx: 'heat',
    note: 'Heat −6: a friendly ear at the station.',
  },
  {
    text: "There's a tin of ringgit under the floor of the old goldsmith shop. My uncle never trusted banks, and my uncle is dead.",
    fx: 'cash',
    note: 'Dirty cash +RM 400.',
  },
  {
    text: "Two of Mat Botak's enforcers are sick of him. They'd work for anyone who pays on Fridays.",
    fx: 'muscle',
    note: "One of Mat Botak's enforcers changes sides: muscle +1.",
  },
  {
    text: 'My cousin works the customs desk at Port Klang. A carton here, a carton there, and nobody counts.',
    fx: 'cash2',
    note: 'Dirty cash +RM 250.',
  },
  {
    text: 'Geng Lorong keeps their takings in a biscuit tin under the counter. Everybody on the street knows except the police.',
    fx: 'respect',
    note: 'Respect +3: you know more than Mat Botak thinks.',
  },
  {
    text: 'The headman in the next block owes my brother a favour. Mention my name.',
    fx: 'discount',
    note: 'Your next expansion costs 20% less.',
  },
  {
    text: "I tell my family I work overtime. I'm at the dance hall every night, and I've never once danced.",
    fx: null,
  },
  { text: 'I still write letters to a girl in Ipoh. I never post them.', fx: null },
  {
    text: "I took twenty ringgit from the temple box when I was nineteen. I've put back two hundred since. It doesn't help.",
    fx: null,
  },
  {
    text: "I'm the one who told the newspaper about the fire. Nobody suspects the quiet ones.",
    fx: null,
  },
  {
    text: 'I bet my bonus on Selangor. Selangor lost. My wife thinks the bonus was cancelled.',
    fx: null,
  },
];

export function seededPick<T>(rng: Rng, a: readonly T[]): T {
  return a[Math.floor(rng() * a.length)];
}
export function weightedPick<K extends string>(rng: Rng, obj: Record<K, { w: number }>): K {
  const ks = Object.keys(obj) as K[];
  let t = ks.reduce((s, k) => s + obj[k].w, 0) * rng();
  for (const k of ks) {
    if ((t -= obj[k].w) <= 0) return k;
  }
  return ks[0];
}

export function generateProfile(rng: Rng, o: ProfileOverrides = {}) {
  const jobDef = o.job ? JOBS.find((j) => j.job === o.job)! : seededPick(rng, JOBS);
  const g: Gender = o.gender || jobDef.g || (rng() < 0.5 ? 'm' : 'f');
  const community = o.community || weightedPick(rng, COMMUNITIES),
    C = COMMUNITIES[community];
  const age = o.age || Math.round(jobDef.age[0] + rng() * (jobDef.age[1] - jobDef.age[0]));
  const given = seededPick(rng, C[g]),
    sur = C.sur ? seededPick(rng, C.sur) : '';
  let name = C.name(g, given, sur);
  if (age >= 52 && rng() < 0.8) name = C.elder[g] + (community === 'eurasian' ? sur : given);
  // clothing: job first, then community and gender shape the options
  let outfits = jobDef.outfit || ['shirt'];
  outfits = outfits.filter(
    (x) => !(g === 'm' && ['kurung', 'saree', 'cheongsam', 'dress', 'nurse'].includes(x)),
  );
  if (!outfits.length) outfits = ['shirt'];
  if (g === 'f' && community === 'malay' && outfits.includes('dress') && rng() < 0.6)
    outfits = ['kurung'];
  if (
    g === 'f' &&
    community === 'indian' &&
    rng() < 0.45 &&
    !['nurse', 'police'].includes(outfits[0])
  )
    outfits = outfits.concat(['saree']);
  const outfit = o.outfit || seededPick(rng, outfits);
  let hat: string | null = o.hat || jobDef.hat || null;
  const hair = age > 60 ? (rng() < 0.3 && g === 'm' ? 'bald' : 'grey') : 'dark';
  if (!hat) {
    if (community === 'malay' && g === 'f' && rng() < 0.7) hat = 'tudung';
    else if (community === 'malay' && g === 'm' && rng() < 0.25) hat = 'songkok';
    else if (g === 'm' && rng() < 0.12) hat = 'fedora';
  }
  const style =
    g === 'f'
      ? hat === 'tudung'
        ? 'none'
        : seededPick(rng, ['long', 'bun', 'bob', 'perm'])
      : hair === 'bald'
        ? 'none'
        : seededPick(rng, ['short', 'short', 'slick', 'crop']);
  const temperKey = o.temper || seededPick(rng, Object.keys(TEMPERS));
  const acc =
    o.acc !== undefined ? o.acc : jobDef.acc && rng() < 0.8 ? seededPick(rng, jobDef.acc) : null;
  const umbrella =
    o.umbrella !== undefined
      ? o.umbrella
      : (acc === null || acc === 'newspaper' || acc === 'books') &&
        rng() < 0.65 &&
        outfit !== 'police';
  const ties: { debt: number; side: Side | null; informant: Side | null } = {
    debt: 0,
    side: null,
    informant: null,
  };
  if (jobDef.tie === 'ahlong' || jobDef.tie === 'den' || jobDef.tie === 'bola')
    ties.side = rng() < 0.5 ? 'you' : 'rival';
  if (jobDef.tie === 'police' && rng() < 0.4) ties.informant = rng() < 0.5 ? 'you' : 'rival';
  if (!jobDef.tie && rng() < 0.2) ties.debt = 300 + Math.round(rng() * 27) * 100;
  if (!ties.side && rng() < 0.08) ties.side = rng() < 0.5 ? 'you' : 'rival';
  const elderly = age >= 65;
  return {
    name,
    given,
    community,
    gender: g,
    age,
    job: jobDef.job,
    jobLines: jobDef.lines,
    tie: jobDef.tie || null,
    temper: temperKey,
    outfit,
    hat,
    hair,
    style,
    acc,
    umbrella,
    smoker: rng() < 0.3,
    height: (g === 'm' ? 1.17 : 1.09) * (0.94 + rng() * 0.12) * (elderly ? 0.96 : 1),
    build: (jobDef.build || 1) * (0.86 + rng() * 0.3),
    skin: SKIN[seededPick(rng, SKIN_BY[community])],
    top:
      outfit === 'police'
        ? 0x1d2a4d
        : outfit === 'nurse'
          ? 0xeeeae2
          : outfit === 'office'
            ? 0xe6e3dc
            : outfit === 'singlet'
              ? 0xe9e5dc
              : ['kurung', 'saree', 'cheongsam', 'dress'].includes(outfit)
                ? seededPick(rng, BRIGHT.concat(CLOTH))
                : seededPick(rng, CLOTH),
    bottom:
      outfit === 'police'
        ? 0x1d2a4d
        : outfit === 'nurse'
          ? 0xeeeae2
          : seededPick(rng, [0x1f2024, 0x2b2d33, 0x3a3530, 0x4a4540, 0x2f3a4a, 0x5a5248]),
    accent: seededPick(rng, BRIGHT),
    hatColor:
      hat === 'tudung'
        ? seededPick(rng, BRIGHT.concat([0xeeeae2, 0x2b2d33]))
        : hat === 'songkok'
          ? 0x111111
          : hat === 'fedora'
            ? seededPick(rng, [0x2b2d33, 0x4a4540, 0x6b5a46])
            : 0x1d2a4d,
    hairColor: hair === 'grey' ? seededPick(rng, [0x8a8780, 0xb8b4ac, 0xd8d4cc]) : 0x15120f,
    stride: elderly ? 0.32 : 0.48 + rng() * 0.12,
    pace: elderly ? 0.45 + rng() * 0.2 : 0.65 + rng() * 0.45,
    hunch: elderly ? 0.16 : rng() * 0.05,
    hope: seededPick(rng, HOPES),
    fear: ties.debt ? FEARS[0] : seededPick(rng, FEARS),
    kin: seededPick(rng, KIN),
    kinLine: seededPick(rng, KIN_LINES),
    secret: o.secret || seededPick(rng, SECRETS),
    secretKnown: false,
    ties,
  };
}
