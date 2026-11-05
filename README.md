# Kota Hitam

*Every business has a back room. Every back room has a price.*

Kota Hitam ("Black City") is a noir racket tycoon set in Kuala Lumpur, 1987. You start with one back-room mahjong den in Chow Kit and build a vice empire of betting shops, bars, loan sharks and laundering fronts, while Geng Lorong and the police try to take it from you. It plays in the browser on an isometric, Tapped Out-style board, with motion-comic cutscenes, an original noir jazz score, and bystanders whose eyes you can look through.

This repository holds the playable prototype (Act I) and the design notes for the full game: a story campaign, a sandbox mode, and an online multiplayer version with realms and seasons.

## Play the prototype

You need Node 22.12 or newer. Google Fonts still load from a CDN, so the game looks best with an internet connection.

```sh
npm install
npm run dev
```

Then open the address Vite prints. Desktop browsers only for now; headphones help.

`npm run build` writes a static build to `dist/`, and `npm run preview` serves it. Opening `index.html` directly no longer works.

## What's in the prototype

- **Chow Kit, 1987:** 16 plots on a rainy street grid, with 12 neighbourhoods to expand into (Kampung Baru, Titiwangsa, Sentul, Jalan TAR, Masjid India, Dang Wangi, Bukit Bintang and more). Fog of war hides everything more than one block past your turf.
- **13 businesses:** street rackets, back rooms, big-money operations and laundering fronts, each with staff, prices, tills and heat.
- **Dirty and clean cash:** rackets earn dirty money; fronts and the Masjid India money changer wash it into clean money for property and expansion.
- **Geng Lorong:** an AI rival that buys land, undercuts, poaches, sabotages and torches. You can strong-arm, torch or buy them out in return.
- **Heat and the police:** raids, bribes, lying low, and a fall ending if heat hits 100.
- **Bystanders:** 22 generated KL residents. Click one to see the street through their eyes and read their inner monologue; follow them long enough and they let a secret slip.
- **Cutscenes and the newspaper:** a six-panel prologue, vignettes, Act I and fall endings, and a weekly *Warta Malam* front page.
- **Recording booth:** export the voice-over script and import actors' takes by file name.

## Controls

| Action | Control |
| --- | --- |
| Look around | Drag the map; scroll to zoom |
| Open a plot's case file | Click the plot |
| Collect a till | Click the cash bubble over a business |
| Pause / speeds | Space, 1, 2, 3 |
| See through a bystander | Click a pedestrian; Esc to return, N for the next |
| Close a case file | Esc |

## Repository layout

| Path | What it is |
| --- | --- |
| `index.html` | Page markup and all CSS |
| `src/main.js` | The game script: simulation, WebGL city, NPCs, audio, cutscenes, UI |
| `docs/DESIGN.md` | Condensed game design: systems, numbers, multiplayer and realm decisions |
| `HANDOFF.md` | Where the project stands, what's untested, and what to build next |
| `AGENTS.md` | Instructions for coding agents working in this repo (Claude Code reads it through `CLAUDE.md`) |
| `assets/vo/` | Voice-over recordings, named by line ID |
| `tests/smoke_test.py` | Headless smoke test of the simulation, economy and NPC systems |

## Content notes

Kota Hitam is a crime story about vice businesses. Prostitution exists only as an abstract, off-screen business (a massage parlour). Human trafficking is never a business the player runs; it appears once, as a story beat where the player decides whether to tip off the police. There is no real-money gambling of any kind.
