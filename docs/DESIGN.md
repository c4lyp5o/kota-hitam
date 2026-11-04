# Kota Hitam — design

Condensed from the shared design doc in claude.ai (the source of truth for design discussion). Numbers marked *(prototype)* are what `index.html` uses today.

## Concept

A real-time-with-pause racket tycoon in a rain-soaked, noir Kuala Lumpur. You start with one back-room mahjong den in Chow Kit and build a vice empire while rival gangs and the police try to take it from you. Think *Two Point Hospital*'s business sim inside *Sin City*, on a Tapped Out-style board, with motion-comic cutscenes.

**Pillars**

- **Vice is a business.** Staff, suppliers, customers, margins and risk; running it well is the game.
- **Turf is the market.** Owning a district means owning its demand.
- **Wars are business moves.** Undercutting, poaching, sabotage and hired muscle, not armies.
- **Heat is the clock.** The more you earn and the louder you play, the harder the city pushes back.
- **Noir is the frame.** Cutscenes, voice-over, newspaper headlines and bystanders tell your rise and fall.
- **KL is a character.** Districts play differently because the real places are different.
- **No dead ends.** Every economic state has a way forward.

## Modes

- **Story:** Prologue (The Debt), Act I (The Hustle: Chow Kit, Pudu), Act II (The Climb: Bukit Bintang, Petaling Street), Act III (The Crown: KLCC, Dataran Merdeka), and endings per victory type plus a fall ending.
- **Sandbox:** no story beats; adjustable rival aggression, starting cash and open neighbourhoods.
- **Multiplayer:** shared realms with seasons (below).

## The board

- Isometric Three.js board, inked toon buildings in KL shophouse pastels, noir grading by default with a Colour toggle.
- Chow Kit is 16 plots (5×5) on a street grid: Jalan Raja Bot, Jalan Raja Alang, Lorong Haji Taib, Jalan Haji Taib.
- Kerb colours show ownership: red for you, teal for Geng Lorong, grey for sale.
- 12 neighbourhoods surround it, 4 plots each: Sentul, Titiwangsa, Jalan Pahang, Kampung Baru North, Jalan Ipoh, Kampung Baru, Jalan TAR, Jalan Raja Muda, Masjid India, Dang Wangi, Jalan Ampang, Bukit Bintang.
- **Expansion** *(prototype)*: only blocks touching your turf; the first costs RM 6,000 clean and respect 15, each further one +RM 3,000 and +5 respect. Paying clears the old buildings into 4 plots for sale; the rival can buy in too.
- **Act I win** *(prototype)*: own 10 lots.

## Time and money

- One in-game day is about 30 seconds at 1× *(prototype)*; speeds 1×, 2×, 4×; one tick per in-game hour.
- **Dirty cash** comes from rackets; **clean cash** comes from fronts and laundering. Lots and expansions cost clean cash; rackets, staff, bribes and jobs cost dirty.
- **Tills:** takings collect in each business's till (cap 1.5 days of takings). A cash bubble appears when it's worth emptying; the bagman empties every till for a 10% cut; raids seize the till.
- **Ways to wash money:** kopitiam front (RM 900/day at 80%), laundromat front (RM 1,800/day at 85%, respect 30), Masjid India money changer (up to RM 1,500 at 60%, once per half day, heat +4). With no clean money, a front can be built with dirty cash at a 60% markup (heat +3).

## Businesses *(prototype)*

| Group | Business | Cost | Per day | Heat/day | Staff | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Street | Bola betting shop | RM 900 | 520 | +2 | 1 | |
| Street | Ekor numbers | RM 700 | 380 | +1.5 | 1 | |
| Street | Contraband cigarettes | RM 800 | 460 | +1.5 | 1 | |
| Street | Counterfeit stall | RM 1,000 | 540 | +1.5 | 1 | Best by day |
| Back room | Mahjong den | RM 1,200 | 700 | +2.5 | 2 | Best at night |
| Back room | Ah Long office | RM 1,500 | 820 | +3 | 2 | Best by day |
| Back room | Back-room bar | RM 1,800 | 1,000 | +3.5 | 2 | Best at night |
| Back room | Massage parlour | RM 2,600 | 1,400 | +5 | 3 | Respect 20; abstract, off-screen |
| Big money | Chop shop | RM 2,200 | 1,150 | +4 | 2 | Respect 15 |
| Big money | Powder room | RM 3,000 | 2,000 | +8 | 2 | Respect 25 |
| Big money | Gambling hall | RM 4,500 | 2,700 | +6 | 3 | Respect 40 |
| Front | Kopitiam front | RM 1,200 clean | 180 clean | −2 | 1 | Launders |
| Front | Laundromat front | RM 3,000 clean | 250 clean | −3 | 1 | Launders; respect 30 |

- **Staff traits:** Honest, Sharp (+25% takings), Sticky-fingered (skims), Talkative (+60% heat), Tough (stops sabotage and arson). Signing fee is two days' wages.
- **Prices:** cheap wins turf, steep earns more and cedes turf.
- **Upgrade:** one extra floor (+50% income, +30% heat, +1 staff slot).

## Rival, heat and the police

- **Geng Lorong** (boss: Mat Botak) moves every 30–50 in-game hours: expand, undercut, poach, sabotage or torch. Torching becomes likelier as your turf share grows.
- **Your jobs against them:** strong-arm (shut a business for two days), torch (burn it; the lot goes up for sale), buy out (respect 45, clean cash).
- **Heat** levels: Whispers, Patrols, Raids, Task force, Crackdown. Raids start at 40; heat 100 is the fall ending. Tools: bribe the station chief, lie low, fronts, sit-downs (three-day truce).
- **Story beat:** around day 5, a note reveals Geng Lorong moves trafficked people through Port Klang. The player can tip off the police anonymously (rival loses a shophouse, heat −12, respect +5) or burn the note. Trafficking is never a playable business.

## Bystanders

- `createNPC(seed, overrides)` returns `{ profile, rig }`. Same seed, same person; any field can be pinned.
- **Profile:** name from Malay, Chinese, Indian or Eurasian name pools with age honorifics; one of 33 jobs; one of 8 temperaments; ties to the underworld (Ah Long debts, payroll for you or Geng Lorong, informants); a hope, a fear, a family member, one secret.
- **Body:** jointed figure (hips, knees, shoulders, elbows), height, build, skin tone, stoop with age; kurung, sarong, saree, cheongsam, uniforms, office shirts, aprons, singlets; tudung, songkok, fedora, caps and hair styles; umbrellas, baskets, briefcases, newspapers, books.
- **POV:** click a pedestrian to see through their eyes; drag to look; click another to hop; Esc returns.
- **Inner voice,** in priority order: the building they pass (shaped by their ties), recent city news, someone they recognise, their own life, the street's mood. No repeats.
- **Secrets:** after about 20 seconds of following, a secret slips; some pay off once (rival move delayed, heat −6, cash, +1 muscle, respect, cheaper expansion).

## Cutscenes, newspaper and audio

- Motion comics on a 2D canvas: inked panels, Ken Burns pans, rain, typed captions. Prologue (6 panels), vignettes, end of Act I, the fall.
- *Warta Malam* front page every in-game Monday with a headline and the week's ledger.
- Original score: slow D-minor noir jazz (sax-like lead, walking bass, brushes, Rhodes, vinyl crackle) over rain and thunder; it thins out as heat rises.
- **Voice-overs:** every spoken line has a stable ID. The recording booth exports a script (ID, file name, speaker, scene, text) and a JSON manifest, and imports takes by file name: `cs_prologue_01.mp3`, `nar_<hash>.mp3`, `npc_<hash>__m.mp3` / `__f.mp3`. Recordings replace browser speech where they exist. Human actors for narrator and main characters; text-to-speech for bystanders.

## Multiplayer

- One shared, always-running KL per realm; every player is a clan boss; the server owns the simulation.
- No pause: about one in-game day per real hour. Tills, laundering and heat tick offline; the till cap is the reason to log in.
- PvP jobs resolve on the server against defences (muscle, tough staff, fronts), with shields after being hit, newcomer immunity and a cap on losses per night.
- Per-boss heat plus a district-wide meter; district crackdowns hit everyone there.
- Syndicates with shared treasury, chat and turf bonuses; sit-downs become server-enforced contracts.
- The newspaper and bystanders name real players and syndicates.
- **Architecture:** browser client (Three.js view, sends requests, predicts with the shared sim) → game server per realm (validates every request, runs the hourly tick, moves AI gangs and police) → Postgres (players, plots, tills, syndicates, news, realm and season). Backend options: Nakama (best fit), Colyseus + Postgres, or Supabase.
- **Rules:** no paid loot boxes, no trading in-game cash for real money.
- **Roadmap:** shared TypeScript sim module → accounts and cloud saves → shared asynchronous city → syndicates, chat, shared newspaper, seasons → load test and a closed first season.

## Realms and land pressure

| Mechanic | Rule |
| --- | --- |
| Realm caps | About 400 active players per realm; new players go to the newest realm; late-season realms merge |
| Growing map | Start with Chow Kit and its ring; unlock districts (Pudu, Brickfields, Petaling Street, Sentul, Kampung Baru, the Golden Triangle) whenever free and AI-held plots drop below 20% |
| Land decay | 7 days offline: places go dark. 14 days: plots seized and returned to the market or AI gangs |
| Size costs | Upkeep and heat rise with empire size; caps of 6 plots per player and 10 per syndicate in any district |
| Home turf | Every player has a private home district with AI rivals; it earns as much as the shared city |
| Seasons | Reset every 8–12 weeks; Hall of Bosses and cosmetics carry over |

- **Newcomer protection:** newcomer-only outer districts, AI reserve land released when land gets tight, a one-week shield.
- **Syndicates span realms as a brand only.** Each realm has its own chapter with its own turf, treasury and member cap; nothing moves between realms.
- **Moving realm** happens only at season end, for a fee that scales with what you bring.
- **Realm identity:** realms are named for weather and hours in Malay (Senja, Hujan, Kabus, Subuh, Ribut, Bayang), never places. Shown in the HUD ("Senja · S3"), the newspaper masthead ("Edisi Senja"), player tags ("Calypso · Senja") and syndicate chapters.
- Since home turf pays as well as the city, the city's pull comes from prestige, leaderboards, syndicate goals, story chapters in prime districts, and being talked about.

## Platform and production

- Web, desktop browsers only for now; Three.js; moving to TypeScript + Vite.
- Real KL district and landmark names; fictional people, gangs and businesses.
- Launch plan: itch.io, then Steam through a desktop wrapper (Electron or Tauri).
