# Voice-over recordings

Recordings are matched to lines by file name. Get the full list of IDs from the game: open **Voice-overs** (title screen or dock), then **Copy recording script (CSV)** or **Copy manifest (JSON)**.

| Line type | File name | Example |
| --- | --- | --- |
| Cutscene panel (narrator) | `cs_<scene>_<nn>.<ext>` | `cs_prologue_01.mp3` |
| Vignette (narrator) | `nar_<hash>.<ext>` | `nar_3fa1c2d9.mp3` |
| Bystander line, male take | `npc_<hash>__m.<ext>` | `npc_189b838c__m.mp3` |
| Bystander line, female take | `npc_<hash>__f.<ext>` | `npc_189b838c__f.mp3` |
| Bystander line, any voice | `npc_<hash>.<ext>` | `npc_189b838c.mp3` |

Accepted formats: MP3, WAV, OGG, M4A, AAC, FLAC, WebM.

IDs for narrator vignettes and bystander lines are hashes of the line's text. If a line's text changes, its ID changes and the old recording no longer matches; re-export the script after editing lines.

In the prototype, imported takes are stored in the browser (IndexedDB). Loading them from this folder is task 5 in `HANDOFF.md`.
