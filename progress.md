Original prompt: PLEASE IMPLEMENT THIS PLAN: Constant Iteration Roadmap for the Pokemon Boricua Engine (13-item engine-first roadmap covering deterministic test hooks, save migrations, data registries, scripting, quests, party/battle refactors, items/capture, AI, map triggers, NPC scheduling, and the asset pipeline).

# Ranked Backlog
1. Deterministic test harness
2. Save envelope + migrations
3. Data registries + validation pass
4. Event/cutscene scripting engine
5. Quest + world-state registry
6. Party roster system
7. Battle phase state machine
8. Item + capture framework
9. Move/status effect engine
10. Trainer AI + encounter tables
11. Map trigger + connection system
12. NPC scheduler + pathing layer
13. Asset/render/audio pipeline

# Current Slice
- Implement the first foundation pass without changing gameplay rules:
- Add seeded RNG, deterministic stepping, and machine-readable debug state.
- Wrap saves in versioned envelopes and migrate legacy raw saves.
- Add validated content registries so bad data fails fast.

# Notes
- Keep the game as plain ES modules plus canvas.
- Prefer minimal vertical slices over broad partial refactors.
- Test every slice through a served build and the Playwright client loop.
- For future assigned tasks, ship the requested change plus one extra small polish improvement whenever it fits cleanly.

# Updates
- Added deterministic engine hooks: seeded RNG, `window.advanceTime(ms)`, `window.render_game_to_text()`, and a query-driven debug bootstrap for `seed`, `deterministic`, `map`, `x`, `y`, and `facing`.
- Refactored the main loop into explicit `step`, `renderFrame`, and loop-mode controls so manual stepping is stable for automation.
- Added save envelopes with a legacy raw-save migration path and sanitized load/save hydration instead of merging arbitrary JSON into live state.
- Added a validated content registry for creatures, moves, types, maps, trainer teams, warps, and dialogue scripts so bad data fails fast at startup.
- Added scene-specific debug snapshots for overworld and battle so automated text state mirrors the actual gameplay view.
- Fixed the Explorer Status panel spacing after the first screenshot pass exposed title/body overlap.

# Verification
- Imported the changed ES modules directly with Node to confirm syntax and module wiring.
- Ran the Playwright game client against `http://127.0.0.1:8000/?deterministic=1&nosave=1&seed=foundation` and verified screenshot/state output for dialogue flow and deterministic movement.
- Confirmed no console-error artifact was produced by the Playwright runs.
- Ran a browser-level migration check with a legacy raw `localStorage` save, verified the game loaded that state correctly, then forced a save and confirmed it rewrote to `{ version: 1, state: ... }`.

# Next Step
- Start epic 4 with a minimal script runner that supports `say`, `setFlag`, `giveItem`, and `warp`, then convert map interactions and one NPC script to the new command format before expanding into quest state.

# Latest Slice
- Implemented a 13-aspect enhancement pass focused on world scale, texture polish, character detail, and battle feel.
- Expanded `island-start` from 26x18 to 34x22.
- Expanded `coast-cove` from 24x16 to 32x20.
- Added new grass-heavy route space and extra encounter-friendly terrain in both maps.
- Added new visible landmarks with fresh marker dialogue in the expanded zones.
- Added four new NPC/trainer presences across the enlarged world so the new space feels inhabited.
- Added finer linework and layered texture to field tiles.
- Added denser grass rendering with more blades, highlights, and tiny bloom specks.
- Added richer water, tree, wall, shrine, and warp rendering for a less placeholder-looking world.
- Added more detail to humanoid models with outlines, trim, cuffs, belt lines, ear shading, and hair highlights.
- Added more detail to battle creatures with feet, tail/crest shaping, underside shading, and highlight strokes.
- Added battle attack animation with lunge, recoil, impact flash, floating damage, and speed-line energy.
- Added a heal pulse animation so item use also reads visually instead of only through text.
- Included one extra polish pass beyond the ask by cleaning the HUD spacing and keeping the prompt system readable in the new expanded camera views.

# Latest Verification
- Re-imported the changed map/render/battle modules after the visual pass to confirm syntax and registry validity.
- Verified the enlarged map dimensions and tile row lengths programmatically.
- Ran the Playwright game client against the expanded `coast-cove` in deterministic mode and confirmed the upgraded texture pass in screenshot plus `render_game_to_text`.
- Forced a deterministic wild battle in headless Chromium, triggered an attack, and visually verified the new battle-hit animation from the captured canvas screenshot.
- Confirmed no Playwright console-error artifact was produced during the overworld validation pass.

# New Latest Slice
- Implemented another 13-upgrade pass centered on map expansion, encounter diversity, scenic battle backgrounds, and future-ready texture drop slots.
- Added an optional asset manifest for battle backdrops and future tile/actor texture overlays.
- Added real drop-in asset paths under `assets/` so later art can be swapped in by filename instead of code changes.
- Extended the asset loader to support optional images without blocking startup.
- Added transparent placeholder PNGs at the optional asset paths so missing art no longer throws browser errors during the test loop.
- Added a battle-backdrop registry for meadow, coast, and grove scene themes.
- Added a procedural battle backdrop renderer that can later be replaced by dropped-in images, with placeholder detection so the scenic fallback still renders now.
- Wired map-specific backdrop metadata through wild encounters, trainer battles, live battle state, and debug snapshots.
- Added weighted encounter tables with per-entry min/max levels.
- Added Bosque Solseta as a new connected map segment.
- Connected Isla Primer Paso to Bosque Solseta through a new eastern route warp and signposted the transition.
- Connected Bahia Brisa to Bosque Solseta through a second route warp and signposted that transition too.
- Added four new creatures plus matching moves to deepen biome-specific encounter identity across maps.
- Rebalanced each map's encounter roster so island, coast, and grove fights now pull from different weighted creature sets.

# New Latest Verification
- Re-imported `src/core/game.js`, `src/scenes/BattleScene.js`, `src/data/maps.js`, and `src/rendering/battleBackdrop.js` with Node after wiring the new slice.
- Revalidated all map row lengths and dimensions programmatically after adding Bosque Solseta and the new warp tiles.
- Ran the Playwright game client against `sunspore-grove` in deterministic mode, inspected the screenshot, and confirmed the new route segment renders cleanly with no console-error artifact.
- Fixed the first browser regression from that run by removing optional-asset 404 noise from the iteration loop.
- Forced a deterministic Bosque Solseta wild battle in headless Chromium, captured pre/post-action screenshots, and visually verified the scenic grove battle backdrop behind the combatants.
- Ran a deterministic island-to-grove warp test in Chromium and confirmed the player transitions from `island-start` into `sunspore-grove` with the expected map key in `render_game_to_text`.

# Next Step
- Keep the constant-iteration rule active: on the next assigned task, ship the requested feature plus one additional small polish improvement, with the next likely target being more map-side content such as another connected route, scripted signposts, or unique encounter gimmicks per biome.

# Alignment Reference
- Added `CODEX_NORTH_STAR.md` at the repo root as the standing creative-vision and systems-alignment document for future Codex iterations.
- Future feature work should be checked against `CODEX_NORTH_STAR.md` before implementation so the game stays aligned with the original-IP creature-collection JRPG vision.

# Latest Mission Slice
- Began implementing the north-star document directly instead of leaving it as planning-only reference.
- Added a real starter trio foundation with `Flameling`, `Brookit`, and `Mosslet` as explicit starting partners.
- Added a new `starter-select` opening scene so fresh runs begin with a partner choice before entering the overworld.
- Added codex tracking foundations for seen and caught creatures, with counts exposed in debug state and the overworld HUD.
- Added creature taxonomy metadata (`category`, `habitats`) so codex entries can grow into richer collection pages later.
- Added storage foundations alongside the six-member party cap so captures can overflow cleanly instead of breaking roster assumptions.
- Added item registry data for healing and capture devices.
- Reworked battle action slot 3 into a future-friendly battle-item path instead of a one-off hardcoded tonic button.
- Added `Snare Orb` capture support for wild battles.
- Added capture resolution that updates codex state and routes overflow captures into storage automatically.
- Added debug bootstrap support for `starter=<key>` so automated tests and future tooling can jump into specific starter states quickly.
- Renamed the primary save slot to `project-tidelight-save` while keeping legacy save-key fallback support.
- Included one extra polish improvement by surfacing codex counts and capture-orb counts in the overworld HUD, and cleaned the starter-screen layout after the first screenshot pass exposed overlap.

# Latest Mission Verification
- Imported the updated game, state, starter-scene, and battle modules directly with Node after wiring the new systems.
- Verified state hydration turns old party-only saves into valid starter-chosen codex-aware saves.
- Ran the Playwright client on a fresh no-save boot and confirmed the starter-selection screen appears instead of dropping straight into the map.
- Ran the Playwright client through a starter choice and confirmed the selected partner enters the overworld with starter key, codex counts, and inventory reflected in `render_game_to_text`.
- Fixed the first UI regression from that pass by moving the starter preview card so it no longer overlaps the trio labels.
- Forced a deterministic low-HP wild battle in Chromium with a full active party, used a `Snare Orb`, and verified the caught creature was sent to storage while codex counts and orb inventory updated correctly.
- Confirmed the capture flow and starter flow produced no browser console-error artifacts.

# Next Step
- Build on this foundation with one route-side content slice that makes the new systems more playable: a starter-lab intro script, a first capture tutorial NPC, or a storage terminal interaction in a town hub.

# Latest Five-Addition Slice
- Added dynamic rival-starter assignment so the rival now takes the counter-choice to the player’s selected starter.
- Added the first rival battle beat on Isla Primer Paso through a new `Rian` trainer encounter that uses the dynamic rival starter in battle.
- Added a healing service interaction in Bahia Brisa so the town now functions more clearly as a recovery hub.
- Added a storage terminal interaction plus a dedicated `storage` scene so active party and overflow creatures can be reviewed at a hub terminal.
- Added a codex kiosk interaction plus a dedicated `codex` scene so seen/caught progress, taxonomy, and habitat notes can be reviewed in-world.
- Included one extra small polish improvement by adding a capture-tutorial NPC in Bahia Brisa and tightening the service-scene header spacing after the first screenshot pass exposed title overlap.

# Latest Five-Addition Verification
- Re-imported the updated game, map, codex, and storage modules with Node after wiring the new scenes and map data.
- Revalidated all map row lengths after placing the new Bahia Brisa service markers and the rival NPC.
- Ran the Playwright game client in deterministic mode against Bahia Brisa and visually confirmed the new hub-service markers, tutorial NPC placement, and updated interaction prompt.
- Ran a headless Chromium validation for the healer interaction and confirmed it restored the active party while presenting the intended nurse dialogue.
- Ran a headless Chromium validation for the storage terminal and confirmed it opened the storage scene with party and stored-creature listings.
- Ran a headless Chromium validation for the codex kiosk and confirmed it opened the codex scene with seen/caught counts plus category and habitat display.
- Ran a headless Chromium validation for the rival battle and confirmed a Brookit-start player correctly faced Mosslet as the rival’s opener.
- Fixed the first screenshot regression from that pass by increasing storage/codex header spacing so the title and body copy no longer overlap.

# Next Step
- Make these new town and rival additions feel authored rather than purely functional by adding a starter-lab sendoff, a first rival dialogue sequence in the overworld before battle, or a tiny early quest/tutorial chain that routes the player through healer, codex, and storage in order.

# Latest Map Polish Slice
- Replaced the obvious outdoor warp pads with future-facing edge `connections` metadata so route exits can behave like connected world segments instead of magic teleports.
- Updated overworld transitions to preserve facing, use route-vs-door fade styling, and surface an arrival banner when a map handoff completes.
- Added dedicated building tiles and repainted the major town/cabin footprints so houses read like buildings instead of generic wall blocks.
- Added two enterable interiors: `Primer Cottage` and `Harbor House`.
- Decorated both interiors with furnished layouts, NPC presence, and hub-service placement inside the harbor building.
- Added real exterior/interior door warps for both buildings and corrected the visible-door alignment after the first screenshot pass exposed a one-tile mismatch.
- Kept the richer interior tile renderer in code for future iterations, but mapped the current interior layouts onto the proven tile palette so the browser test loop stays stable.

# Latest Map Polish Verification
- Re-imported the updated config, physics, map, registry, tile-render, and overworld modules with Node after wiring the slice.
- Revalidated all map dimensions, row lengths, connection destinations, and warp destinations programmatically.
- Ran the Playwright client against `coast-cove` and confirmed the refreshed building facade renders cleanly in-browser.
- Ran the Playwright client against `harbor-house` and `primer-cottage` and visually confirmed both interiors render correctly with their new layouts and NPC placement.
- Ran a short deterministic route-trigger capture from the east edge of `island-start` and confirmed `render_game_to_text` reports a pending route transition to `coast-cove` with the expected destination coordinates.
- The first browser regression was a mismatched exterior-door warp coordinate; fixed by realigning the coast and cottage door warps to the painted doorway tiles and revalidating the map registry.
- I did not wait for a full end-to-end long fade capture through an entire route handoff because the frame-stepped client becomes prohibitively slow on longer transition runs in this environment; instead I validated the trigger state plus destination mapping directly.

# Next Step
- Build on this with one authored progression slice: add a first interior-specific quest/tutorial beat, or introduce an explicit route-name banner and neighboring-map signposts for every remaining region handoff.

# Latest North-Star Slice
- Implemented five mission-aligned progression features as one coherent early-game loop instead of isolated utilities.
- Added an explicit objective tracker in the overworld HUD and debug state so the player always has a nearby authored goal.
- Added Tala's first sendoff beat in Primer Cottage, including starter-specific advice plus supply grants for route play.
- Added a coral economy foundation with money in state/HUD, explicit trainer payouts, and battle reward preview text.
- Added a usable Harbor House provision counter plus a dedicated shop scene for buying tonics and Snare Orbs.
- Added one-time route pickups with persistent collection flags, reward dialogue, and visible sparkle markers so short-term discoveries keep the region feeling rewarding.
- Included extra polish by cleaning the lead-creature HUD layout and standardizing shop purchase wording around `coral`.

# Latest North-Star Verification
- Re-imported the updated overworld and game modules plus revalidated map row lengths and registry integrity after wiring the new interactions.
- Ran a deterministic browser probe for Tala in Primer Cottage and verified the first-sendoff dialogue, starter-specific pathing advice, and supply grant (+1 tonic, +2 Snare Orbs).
- Ran a deterministic browser probe for the new Isla Primer Paso route pickup and verified one-time reward handling plus inventory/money updates.
- Ran a deterministic browser probe for Harbor House and verified the new shop scene opens from the counter and purchases spend coral correctly.
- Ran a deterministic browser probe for a trainer payout and verified defeating Rian awards the configured 72 coral and marks the trainer as defeated.
- Opened and visually inspected the resulting screenshots for Tala, pickup, shop, and reward states, then fixed the first visual issue by moving the lead-creature badge away from the panel title.
- The first logic regression surfaced during Tala validation: legacy-state migration was auto-marking `talaBriefed` too early when booting directly into `primer-cottage`; fixed by narrowing the opening-pocket migration rule.
- Ran a browser console/page-error check on the Harbor House shop flow and confirmed no new errors were emitted.
- The stock `web_game_playwright_client` launched but did not return cleanly in this environment, so I completed the screenshot/state verification loop with direct Playwright probes from the same skill runtime instead.

# Next Step
- Turn this into a fuller authored opening by adding the first capture tutorial beat on-route, or by introducing the first league-facing prep chain between Primer Cottage, Bahia Brisa, and Bosque Solseta.

# Latest Complex-Systems Slice
- Implemented a reusable command-driven script engine instead of relying on dialogue-only NPC arrays.
- Added script commands for dialogue, flags, items, money, healing, quest progression, badge awards, field-ability unlocks, field-gate clearing, conditional branching, delays, and scripted trainer battles.
- Added a quest/world-state registry with `first-expedition` so the opening route now has explicit authored objectives instead of scattered progression checks.
- Synced quest progression to real gameplay triggers including trainer defeats, Harbor House provisioning, and field-gate clearance.
- Added campaign-state persistence for badges, field abilities, cleared field gates, and quest status so the new progression systems survive save/load cleanly.
- Added `Leader Marza` as the first leader-style scripted challenge inside Harbor House, including a conditional pre-battle requirement, scripted reward flow, Coast Badge award, and `Shearvine` traversal unlock.
- Added a real field-gate system on Bosque Solseta with blocked/cleared scripts, collision enforcement, and quest completion on successful clearance.

# Latest Complex-Systems Verification
- Re-imported the updated game, overworld, registry, quest-system, and script-system modules with Node after wiring the new systems together.
- Revalidated map dimensions, quest registry integrity, and script validation so the new command blocks fail fast if malformed.
- Ran a deterministic Chromium probe for Leader Marza and confirmed the battle resolves into the expected post-battle reward state: Coast Badge awarded, `Shearvine` unlocked, Marza marked defeated, and the objective advanced to the grove wall.
- Ran a deterministic Chromium probe for the Bosque Solseta bramble wall and confirmed `Shearvine` clears the gate, removes the blocking tile, completes `first-expedition`, and falls back to the free-roam objective text.
- Opened and visually inspected the Marza reward and gate-clear screenshots to confirm the scripted flow matched `render_game_to_text`.
- Ran a save/reload persistence probe and confirmed the new quest, badge, ability, gate-clear, and map-location state persist inside the versioned save envelope and hydrate correctly on reload.
- Re-ran the stock `web_game_playwright_client`; it completed without useful stdout in this environment, so the reliable verification loop remained the direct Playwright skill-runtime probes above.

# Next Step
- Build the next north-star system slice on top of this foundation: a fuller codex/storage progression beat, a first capture tutorial chain with scripted branching, or a broader leader framework that reuses Marza's script/badge/gate pattern.
