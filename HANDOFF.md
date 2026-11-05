# Handoff

*Last updated: 5 November 2026. Written at the end of the prototyping sessions in claude.ai, for picking the project up in Claude Code.*

## Where things stand

The prototype (`index.html`, the simulation in `src/sim/`, and everything else in `src/main.js`) plays the whole of Act I: a prologue cutscene, the Chow Kit economy, the Geng Lorong rival, heat and raids, expansion into 12 neighbourhoods, the end-of-Act-I and fall endings, a weekly newspaper, bystander POV with generated NPCs, fog of war over the city, and a recording booth for voice-overs. It runs on Three.js r187 and builds with Vite. The owner checked the 3D view on a real GPU before the move to Vite; since then it has only been rendered under software WebGL. The design is written up in `docs/DESIGN.md`.

The original design doc lives in claude.ai as a shared doc and is the source of truth for design discussion; `docs/DESIGN.md` is a condensed copy of it for this repo.

## Decisions already made

| Topic | Decision |
| --- | --- |
| Genre | Racket tycoon (not a 4X): real time with pause, tills you collect, a Tapped Out-style board |
| Modes | Online multiplayer, a story campaign, and an offline sandbox |
| Art | Keep the inked toon 3D: isometric Three.js board with ink outlines, noir grading by default, a Colour toggle |
| Platform | Web, desktop browsers only for now |
| Engine | Stay on Three.js; move to TypeScript + Vite |
| Places | Keep real KL district and landmark names; people, gangs and businesses are fictional |
| Voice | Human actors for narrator and main characters; text-to-speech for bystanders; recordings imported by line ID |
| Realms | About 400 active players each; named for weather and hours in Malay (Senja, Hujan, Kabus, Subuh, Ribut, Bayang), never place names |
| Home turf | Every player has a private home district that earns as much as the shared city |
| Syndicates | Brand spans realms; turf, treasury and cash stay in each realm's chapter |
| Moving realm | Only at season end, for a fee |
| Fog of war | Only unlocked blocks and one layer beyond them are visible. Derived from `S.blocks`, so it isn't saved; off in bystander POV |
| Content | Massage parlour is abstract and off-screen; trafficking is only a story beat (tip off the police or not); no real-money gambling |

## Known issues and untested areas

- **Frame rate:** on the owner's GPU it went from 45 to 60 fps once `bake()` merged plot buildings, plot bases and the backdrop by material, taking draw calls from about 1,750 to 1,190 per frame (counted under software WebGL). Frame rate with fog of war on hasn't been measured. About half of the remaining calls are NPCs (27 each), which rigged characters should fix (task 4).
- **Fog of war checks:** the visibility rule is in the smoke test and the fog has been rendered under software WebGL. A pointer sweep confirmed fogged blocks can't be hovered. Turning fog off in POV hasn't been tested.
- **Lightning is very bright.** A bolt blows most of the visible city out to white for a moment. It's existing behaviour and may be worth softening.
- **Three.js is r187,** pinned in `package.json`. Colour management is off and the legacy point light falloff is patched into `ShaderChunk` at the top of the game script, so recheck that patch on any upgrade: it replaces an exact line and silently does nothing if the line changes.
- **Tooling gaps:** `src/main.js` isn't type-checked or Prettier-formatted yet (task 1 deals with that as it splits the file). `npm audit` reports 10 moderate warnings, all from `minimatch` through the dev-only lint tools, and none reach the shipped game. Its suggested fix downgrades ESLint, so it hasn't been applied.
- **Balance is rough.** Numbers in `BIZ`, raid odds, rival move timing and expansion costs were set by hand and checked only in quick simulated runs.
- **Voice-over recordings are stored per browser** (IndexedDB) in the prototype. In the real project they should ship from `assets/vo/`.
- The `window.__kh` debug hook is exposed for tests; remove or guard it before any public release.

## Next tasks, in order

1. **Split `src/main.js` into TypeScript modules:** `sim/` is done; next are `render/`, `npc/`, `pov/`, `audio/`, `vo/`, `cutscenes/`, `ui/`. Keep behaviour identical; the smoke test is the guard rail. Remove each file from `.prettierignore` as it's split, and turn on type checking.
2. **Make the simulation deterministic and serialisable:** seeded RNG passed in (not `Math.random`), a pure `tick(state, hours)` and `apply(state, action)`. This is what the multiplayer server will run.
3. **Load voice-overs from `assets/vo/`** using the manifest the recording booth exports, falling back to the booth's browser storage during development.
4. **Swap procedural NPC bodies for rigged GLTF characters,** keeping `createNPC`'s profile data and API.
5. **Sandbox mode:** a setup screen for rival aggression, starting cash and which neighbourhoods are open.
6. **Act II** (Bukit Bintang and Petaling Street) and the remaining clans from the design.
7. **Multiplayer groundwork:** accounts and cloud saves first, then a shared asynchronous realm. Nakama is the recommended backend; see `docs/DESIGN.md`.

## Useful entry points

These are in `src/main.js` unless a path is given.

- New economy rules: `BIZ` in `src/sim/data.ts`, then `hourTick()` and `act()` in `src/sim/simulation.ts`.
- New bystander lines: `JOBS`, `TEMPERS`, `TYPE_LINES`, `NEWS_LINES` and friends; `composeThought()` decides what gets said.
- New cutscenes: add panels to an array like `PROLOGUE` and an art function to `ART`; give each panel an `id` for voice-over.
- New story beats with choices: copy `showTip()` and queue it with `G.overlays.push(...)`.
