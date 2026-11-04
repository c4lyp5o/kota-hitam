# AGENTS.md

Guidance for coding agents (Claude Code and others) working on Kota Hitam. Read `HANDOFF.md` first for current status and the next tasks; read `docs/DESIGN.md` for how the game is meant to work.

## The project in one paragraph

Kota Hitam is a noir racket tycoon set in Kuala Lumpur, 1987, played in the browser. Today it is a single-file prototype (`index.html`, about 3,000 lines) built on Three.js r187, loaded as an ES module from jsDelivr. The long-term plan is a TypeScript + Vite project with a shared simulation module that runs on both client and an authoritative game server, for a multiplayer version with realms and seasons alongside a story campaign and a sandbox mode.

## Running and testing

- Run: serve the folder statically (`npx serve .` or `python3 -m http.server`) and open `index.html` in a desktop browser.
- Smoke test: `python3 tests/smoke_test.py` (needs `pip install playwright` and `playwright install chromium`, or set `CHROME=/path/to/chrome`). It drives the game headlessly through the `window.__kh` debug hook and fails on any page error.
- Headless Chromium can render the WebGL view in software (`--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`), which is enough for screenshots of the canvas and draw-call counts but says nothing about frame rate. Page screenshots can time out because the page never goes idle, so read the canvas with `toDataURL` inside `requestAnimationFrame`. A white frame is probably lightning, not a bug: the first bolt fires 8 seconds in at night. When you change rendering code, say so and ask the user to check it in a real browser.
- After any edit, at minimum extract the inline script and run `node --check` on it; the file is large and one syntax error blanks the whole game.

## Map of `index.html`

Sections are marked with banner comments (`/* ===== NAME ===== */`). Search for the banner rather than trusting line numbers.

| Section | What lives there |
| --- | --- |
| `<style>` | All CSS. Single committed dark look; tokens on `:root` (`--ink`, `--bone`, `--paper`, `--blood` for the player, `--lorong` for the rival, `--sodium` for money) |
| `DATA` | `BIZ` (13 businesses and their numbers), `GROUPS`, `RIVAL_TYPES`, `TRAITS`, `NAMES`, `HEAT_LEVELS`, `PRICE`, `BLOCKS` (12 expansion neighbourhoods), `blockAdjacent()`, `blockVisible()`, `lotAddress()` |
| `STATE` | `newState()` (save format `v:3`, 64 lots), `S` is the live game state |
| `SIMULATION` | `advance()`, `hourTick()`, `dayEnd()`, `raid()`, `rivalMove()`, tills (`tillCap`, `canCollect`, `collect`) |
| `player actions` | `act(kind, lot, arg)`: buy, open, upgrade, price, hire, fire, close, strong-arm, torch, buyout, collect, expand |
| `HUD / UI` | `updateHUD()`, `renderFile()` (the case-file panel), goals, log |
| `AUDIO` | WebAudio score: instruments, the 16-bar tune (`FORM`, `MEL`), scheduler, sound effects (`sfx`) |
| `VOICE-OVERS` | Line IDs, recording-script export, IndexedDB storage, playback, the recording booth UI |
| `WEBGL CITY` | Renderer, toon materials with ink outlines, static mesh merging (`bake`), plots (`makePlot`, `buildPlot`), backdrop, cars, police, fire, post-processing (noir grade, bloom, grain), fog of war (`fogCellOpen`, `fogTick`, `fogOver` in the composite shader), input, `syncScene()` |
| `NPC FACTORY` | `createNPC(seed, overrides)` → `{ profile, rig }`, `generateProfile`, `buildRig`, walking and idle animation |
| `bystander POV & inner voice` | `composeThought()`, secrets, `enterPOV`/`exitPOV`, `povTick()` |
| `CUTSCENES` | Motion-comic renderer on a 2D canvas, panel art functions (`ART`), `PROLOGUE`, `ACT_END`, `FALL`, `vignette()` |
| `NEWSPAPER` | Weekly *Warta Malam* front page |
| `FLOW` / save / wiring / main loop | New game, act completion, fall, `localStorage` saves (`kotahitam.save`), event wiring, `frame()` |

The simulation (`SIMULATION`, `player actions`, `STATE`) has no WebGL dependencies. Keep it that way: it is the piece that moves to a shared TypeScript module and then to the server.

## Conventions

- **Tone of in-game text:** short, specific, noir. Third-person narration in cutscenes, first-person inner voice for bystanders. Malaysian English with Malay, Cantonese and Tamil words where natural (kopitiam, Ah Long, longkang, Mak Cik). No real-world brand products in signs.
- **Real places, fictional people.** District and street names are real KL places and stay that way. Every person, gang and business is fictional. Realm names (multiplayer) are never place names.
- **No dead ends.** Every economic state must have a way forward. Example: fronts can be built with dirty cash at a markup, and the money changer always converts some dirty cash to clean.
- **Stable voice-over IDs.** Cutscene panels have explicit IDs (`cs_prologue_01`); other lines are hashed from their text (`nar_…`, `npc_…`). Changing a line's text changes its ID and orphans its recording, so update `assets/vo/` or note it in the PR.
- **Saves:** bump `v` in `newState()` and add a migration in `start()` whenever the save shape changes.
- **Performance:** the city already has 64 plots and 22 jointed NPCs. Avoid per-object point lights (neon uses ground glow planes instead) and prefer instancing for repeated meshes. Pass static parts through `bake()` so they merge by material; anything that moves on its own has to stay out of it, while material colour changes still work. Far towers stay out too, because they have to hide when fogged.

## Content boundaries (do not change without the owner's say-so)

- Prostitution exists only as an abstract, off-screen business (the massage parlour). No sexual content.
- Human trafficking is never a business, mechanic or source of profit. It appears only as the story beat where the player chooses whether to tip off the police.
- No real-money purchases of anything that resembles gambling: no paid loot boxes, no trading in-game cash for real money.
- No real, identifiable public figures as characters.

## Git

- Small, focused commits with clear messages. Run the smoke test before committing.
- Don't commit large binary audio without asking; voice-over files may move to Git LFS.
