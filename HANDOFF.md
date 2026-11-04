# Handoff

*Last updated: 4 November 2026. Written at the end of the prototyping sessions in claude.ai, for picking the project up in Claude Code.*

## Where things stand

The single-file prototype (`index.html`) plays the whole of Act I: a prologue cutscene, the Chow Kit economy, the Geng Lorong rival, heat and raids, expansion into 12 neighbourhoods, the end-of-Act-I and fall endings, a weekly newspaper, bystander POV with generated NPCs, and a recording booth for voice-overs. The design is written up in `docs/DESIGN.md`.

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
| Content | Massage parlour is abstract and off-screen; trafficking is only a story beat (tip off the police or not); no real-money gambling |

## Known issues and untested areas

- **The 3D view has never been checked on a real GPU by the person who wrote it.** All headless testing ran without WebGL. The economy, UI, NPC profiles, thoughts, expansion, money changer and voice-over import were tested; the jointed NPC bodies, toon buildings, POV camera and post-processing were written blind. Expect visual bugs (scales, outline thickness, clipping, sign orientation).
- **Performance is unmeasured.** 64 plots with ink outlines plus 22 NPCs of about 20 meshes each is likely 2,000+ draw calls. Merging static geometry and instancing are the first fixes if frame rate suffers.
- **Three.js r128 is old** (pinned for the single-file CDN build). Upgrading means replacing `THREE.RGBFormat` in the toon gradient and checking `WebGLRenderTarget` options.
- **Balance is rough.** Numbers in `BIZ`, raid odds, rival move timing and expansion costs were set by hand and checked only in quick simulated runs.
- **Voice-over recordings are stored per browser** (IndexedDB) in the prototype. In the real project they should ship from `assets/vo/`.
- The `window.__kh` debug hook is exposed for tests; remove or guard it before any public release.

## Next tasks, in order

1. **Look at the prototype in a browser** and fix whatever the blind-written 3D got wrong. Take screenshots of the city, a bystander's POV and the cutscenes.
2. **Set up the project:** Vite + TypeScript, Three.js from npm (current version), ESLint and Prettier, GitHub Actions running the smoke test.
3. **Split `index.html` into modules:** `sim/` (no rendering imports), `render/`, `npc/`, `pov/`, `audio/`, `vo/`, `cutscenes/`, `ui/`. Keep behaviour identical; the smoke test is the guard rail.
4. **Make the simulation deterministic and serialisable:** seeded RNG passed in (not `Math.random`), a pure `tick(state, hours)` and `apply(state, action)`. This is what the multiplayer server will run.
5. **Load voice-overs from `assets/vo/`** using the manifest the recording booth exports, falling back to the booth's browser storage during development.
6. **Swap procedural NPC bodies for rigged GLTF characters,** keeping `createNPC`'s profile data and API.
7. **Sandbox mode:** a setup screen for rival aggression, starting cash and which neighbourhoods are open.
8. **Act II** (Bukit Bintang and Petaling Street) and the remaining clans from the design.
9. **Multiplayer groundwork:** accounts and cloud saves first, then a shared asynchronous realm. Nakama is the recommended backend; see `docs/DESIGN.md`.

## Useful entry points in `index.html`

- New economy rules: `BIZ` in `DATA`, then `hourTick()` and `act()`.
- New bystander lines: `JOBS`, `TEMPERS`, `TYPE_LINES`, `NEWS_LINES` and friends; `composeThought()` decides what gets said.
- New cutscenes: add panels to an array like `PROLOGUE` and an art function to `ART`; give each panel an `id` for voice-over.
- New story beats with choices: copy `showTip()` and queue it with `G.overlays.push(...)`.
