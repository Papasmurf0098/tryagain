# CODEX NORTH STAR
## Project Tidelight

This file is the standing creative-alignment reference for every future Codex iteration. Before adding systems, story beats, art direction, creatures, maps, UI, or battle mechanics, check the work against this document. If a proposed change weakens the exploration loop, capture loop, six-member party identity, or authored-region feel, revise it.

Short iteration check:
- Does this change strengthen exploration, collection, party-building, or regional progression?
- Does it preserve a classic handheld JRPG identity instead of drifting into roguelike, sandbox, or autobattler design?
- Does it make Project Tidelight feel more original rather than more derivative?
- Does it reinforce a compact, memorable, hand-authored region?
- Does it create a better creature-ownership fantasy instead of only adding surface polish?

## 1. One-Page Creative Vision Statement
Project Tidelight is an original monster-collection JRPG built around the same structural fantasy that made classic handheld creature adventures compelling: a young explorer leaves home with a first partner, crosses a tightly connected region, discovers strange species in distinct habitats, builds a trusted six-member team, defeats a sequence of regional challenge leaders, confronts a dangerous criminal faction, and proves mastery in a final elite gauntlet. The game should feel like a late-90s portable adventure in pacing, readability, and sense of place, but every creature, location, faction, line of dialogue, and visual motif must belong to a distinct original IP.

The heart of the game is exploration-first progression. The player does not menu-hop between isolated battles. They walk real routes, enter caves, pass through forests, cross shorelines, revisit old roads with new traversal abilities, and slowly understand the geography of the region. Each town matters because it is a relief point, a source of rumor, a place to heal, a place to shop, and a place where local identity shows through architecture, NPC habits, and creature ecology. Each route matters because it connects spaces, teaches danger, and offers discoveries worth remembering.

The creature loop must feel emotional, not merely mechanical. A wild creature is first an unknown, then a threat, then a possibility. The player survives the encounter, studies the target, weakens it carefully, captures it with a limited resource, names it if they choose, and begins turning a wild find into a long-term companion. Capturing is not a side mode. It is one of the game’s central verbs. Training is not just grinding numbers. It is the steady transformation of a fragile or quirky creature into a specialized, dependable party member that the player remembers.

The six-member active party limit is essential. The player should feel ownership, tradeoffs, and attachment. Storage is useful, but it should never erase the meaning of choosing who travels with you now. Party order should matter, lead creatures should define battle openings, and team composition should solve real problems across routes, leaders, rival fights, and villain encounters. The goal is not to carry every answer at once; the goal is to shape a team identity.

Battle must be elegant, readable, and strategically decisive. A newcomer should understand the verbs immediately: Fight, Item, Switch, Run. A veteran should care about typing, speed, status, move economy, matchup planning, role coverage, and when to preserve or sacrifice momentum. Most battles should remain 1v1 for clarity, with tactical depth coming from creature builds, opponent design, and campaign pacing instead of combat clutter. Moves should be limited-use, types should matter strongly, and evolution should create genuine reward spikes that reframe how a creature feels in battle.

The region of Tidelight should feel like a child-friendly expedition with real stakes. The mood is adventurous, curious, and lightly competitive. NPCs should be short, charming, and useful. The world should reward forward motion constantly: a new trainer, a hidden item, a new codex entry, a traversal shortcut, a new leader clue, a rival ambush, a suspicious faction hideout. The villain faction should threaten ecology, trade, infrastructure, or sacred sites in ways that naturally intersect with exploration spaces. The rival should serve as a mirror of growth, appearing at moments that reinforce pacing and party development.

Project Tidelight must modernize carefully. Quality-of-life improvements are welcome when they reduce friction without removing the genre’s identity. Better inventory sorting, clearer codex tools, cleaner storage management, optional accessibility aids, and better tutorials all support the vision. What cannot be removed are the six-member active party cap, route-based exploration, meaningful capture, type-driven strategy, league progression, authored traversal gating, and the sense that story completion and collection completion are two different finish lines.

## 2. Core Gameplay Loop Diagram In Text
```text
Leave town prepared
  -> explore route / cave / forest / coast
  -> talk to NPCs, scout trainers, find items, solve light traversal obstacles
  -> enter hazard biome
  -> trigger wild encounter
  -> assess species + weaken target + apply status
  -> capture or defeat
  -> update codex + optionally nickname + adjust party or storage plans
  -> continue route with reduced resources
  -> reach new hub and heal / shop / store / gather hints
  -> train team for leader, rival, or faction encounter
  -> win badge / traversal permission / story clearance
  -> unlock new region path and backtracking secrets
  -> repeat until elite challenge and champion proof
```

## 3. Mechanical Systems Breakdown
### Overworld Structure
- Top-down, tile-based overworld with authored towns, routes, caves, forests, shorelines, ruins, and small dungeons.
- Towns provide healing, shops, storage terminals, NPC guidance, side interactions, and story beats.
- Routes provide trainers, hidden items, shortcuts, hazard biomes, and small environmental puzzles.
- The region should be compact and densely memorable, with backtracking loops and shortcuts instead of open-world sprawl.

### Creature Collection
- Wild encounters occur in specific biome hazards such as grass, caves, ruins, tidal flats, and water routes.
- Each species has habitat tags, rarity weighting, codex data, evolution rules, learnset intent, and encounter identity.
- Codex tracks Seen, Caught, Habitat, Category, evolution lineage, and notable progression markers.
- Captured creatures may be nicknamed immediately.

### Party And Storage
- Exactly 6 active party slots.
- Any extra owned creatures are stored at town terminals or equivalent rest stations.
- Lead slot matters for battle openers and some overworld flavor systems.
- Storage should be easy to manage, but not globally available from anywhere.

### Battle
- Core commands: Fight, Item, Switch, Run.
- Battles are primarily 1v1 for readability and campaign pacing.
- Each creature has HP, Power, Guard, Focus, Ward, Speed, elemental typing, conditions, and up to 4 active moves.
- Moves use limited charges, so resource attrition matters across long routes.
- Typing should have strong enough matchup impact that team-building changes outcomes.

### Growth
- Experience comes from wild battles, trainer battles, and select story events.
- Leveling improves stats and unlocks moves through learnsets or evolution triggers.
- Evolution is a major milestone and should visibly change role, silhouette, and emotional value.
- Overworld trainers grant money and remain defeated unless a later rematch system is deliberately added.

### Economy
- Shops prioritize healing items, condition cures, capture devices, route utilities, and a few specialty goods.
- Route attrition matters. Towns should feel like a reset point the player earns.
- Money pressure should be mild but real early on.

### Social Meta
- Full codex completion should require more than solo story completion.
- Long-term plans include version differences, branch-exclusive creatures, trade evolutions, and asynchronous exchange or network trading.
- Optional player-vs-player battles or team comparison should exist as a separate mastery layer, not the main campaign loop.

## 4. Regional Progression Outline
### Region Identity
The Tidelight Archipelago is a sunlit chain of compact islands, forests, caves, trade ports, uplands, and ancient tide-carved ruins. The world is colorful, readable, and adventurous, with each subregion built around a strong local ecology and traversal theme.

### Main Campaign Flow
1. `Loma Claro`
   The hometown. Starter choice, first sendoff, first codex assignment, first rival encounter setup.
2. `Primer Paso Trail`
   Early route teaching wild encounters, trainer line-of-sight, items, and party damage management.
3. `Bahia Brisa`
   First service town. Healing center, shop, storage terminal, simple NPC hints, first badge prep.
4. `Bosque Solseta`
   Early forest route and mini-dungeon hybrid. Introduces denser encounters, status pressure, and faction scouts.
5. `Faro Salino`
   Cliffside harbor town and first serious traversal fork. Access to tide caverns and the second leader.
6. `Gruta Nacar`
   Cave dungeon that introduces darkness, switchbacks, and boulder-routing puzzles.
7. `Cantera Obsidia`
   Mining city with industrial-faction pressure and a sturdier midgame leader.
8. `Manglar Velo`
   Marsh and tide-route zone where water traversal opens the map and encounter diversity widens.
9. `Mirador Cumbre`
   Highland observatory city with wind paths, rival escalation, and a more open midgame structure.
10. `Ruinas de Alba`
   Ancient ruin network tied to traversal gating, codex lore, and the antagonist faction’s goals.
11. `Puerto Corona`
   Late-game capital and league checkpoint. Final shops, elite prep, and final rival clash.
12. `Cumbre de los Ocho`
   Elite gauntlet and champion proving ground.

### Structure Rule
- Early game is linear enough to teach systems clearly.
- Midgame widens through traversal unlocks and branching route order.
- Late game reconverges into faction climax, rival climax, and elite challenge.

## 5. Starter Trio Design
### Fire Starter: `Flameling`
- Concept: a bright-eyed ember cub that begins fast and fragile, then grows into a daring frontline striker.
- Role: aggressive early attacker with clean damage and burn pressure.
- Evolution line: `Flameling -> Cinderoar -> Solferal`
- Final identity: Fire/Light attacker that rewards momentum and punishes slow setups.

### Water Starter: `Brookit`
- Concept: a playful river otter hatchling that learns positioning, disruption, and flexible coverage.
- Role: balanced tempo creature with defensive utility and steady special damage.
- Evolution line: `Brookit -> Rillune -> Maritide`
- Final identity: Water/Wind controller with speed tools and route utility crossover.

### Leaf Starter: `Mosslet`
- Concept: a shy moss-backed gecko that becomes a resilient guardian of ruins and old forests.
- Role: bulky status-and-sustain creature that teaches patience and matchup play.
- Evolution line: `Mosslet -> Thornisk -> Verduron`
- Final identity: Leaf/Stone tank that anchors teams and enables long-route stability.

### Starter Design Rules
- Each starter must feel strong in a different way by the first leader.
- Each final evolution should have a clear silhouette and combat role.
- Each line should support one overworld traversal concept later in the campaign.

## 6. Leader Progression Plan
1. `Leader Marza` at `Bahia Brisa`
   Theme: Stone and shoreline defense.
   Lesson: elemental advantage, raw durability, and why switching matters.
   Reward: first badge and permission for `Shearvine`.
2. `Leader Izel` at `Bosque Solseta Hall`
   Theme: Leaf, poison, and sustain pressure.
   Lesson: status conditions and attrition.
   Reward: second badge and access to deeper forest routes.
3. `Leader Nereo` at `Faro Salino`
   Theme: Water and speed control.
   Lesson: turn order, pivots, and safe use of items.
   Reward: `Tideglide`.
4. `Leader Bronce` at `Cantera Obsidia`
   Theme: Stone and labor beasts.
   Lesson: breaking defensive cores and preparing a broad move pool.
   Reward: `Stonebind`.
5. `Leader Alira` at `Manglar Velo`
   Theme: Toxin, mud, and control.
   Lesson: layered conditions and route-prep discipline.
   Reward: expanded marsh access.
6. `Leader Zefo` at `Mirador Cumbre`
   Theme: Wind and evasive aerial threats.
   Lesson: accuracy, tempo, and anti-sweep planning.
   Reward: `Gustlift`.
7. `Leader Luxa` at `Ruinas de Alba`
   Theme: Light and ancient focus-based casters.
   Lesson: special offense, resist planning, and team balance.
   Reward: `Lumenwake`.
8. `Leader Corven` at `Puerto Corona`
   Theme: mixed veteran team built around synergy rather than one type.
   Lesson: full-roster readiness before the elite challenge.
   Reward: league clearance and access to `Cumbre de los Ocho`.

### Elite Stretch
- Elite Four should each test a different high-level skill: offense pacing, endurance, status adaptation, and role compression.
- Champion battle should feel like the final proof of party identity, not only the hardest numbers check.

## 7. Creature Capture And Battle Ruleset
### Encounter Rules
- Wild encounters are tied to explicit biome hazards.
- Encounter tables are local, weighted, and identity-driven by region.
- Rare species should feel meaningful because of place, timing, or route depth.

### Battle Rules
- Default format is 1v1 turn-based.
- Player commands are `Fight`, `Item`, `Switch`, and `Run`.
- `Run` is allowed in wild battles and blocked in most trainer battles.
- Each creature may equip up to 4 moves.
- Each move has limited charges.
- Speed usually decides turn order, with a few move-level exceptions.
- Types matter strongly, and dual types should create expressive team-building choices.
- Core conditions include Burn, Shock, Venom, Sleep, Chill, and Bind or their final-setting equivalents.

### Capture Rules
- Capture can only be attempted in wild battles.
- Capture chance improves when the target has low HP, helpful status conditions, and a better-quality capture device.
- Some species should have temperament or rarity modifiers that make them harder to secure.
- Capture is a resource decision, not a guaranteed action.
- On capture, the creature is sent to the active party if space is available; otherwise it goes to storage.

### Growth Rules
- Experience is granted for defeating wild creatures, trainers, and key story threats.
- Move learning should force real choices once the 4-move limit is reached.
- Evolution triggers may include level, item, trade, friendship, location, or time-based conditions.
- Early evolutions should create excitement; late evolutions should feel earned and identity-defining.

## 8. Field Abilities And Gating Uses
1. `Shearvine`
   Battle use: cuts through barrier effects or high-cover defenses.
   Exploration use: clears thorn walls, overgrowth, and vine-blocked shortcuts.
2. `Tideglide`
   Battle use: water maneuver with repositioning or speed utility.
   Exploration use: travels across marked water routes and tidal channels.
3. `Stonebind`
   Battle use: heavy earth move or control effect.
   Exploration use: pushes boulders, braces collapsing paths, and activates pressure plates.
4. `Lumenwake`
   Battle use: light-element attack or accuracy support.
   Exploration use: illuminates caves, reveals faded runes, and exposes hidden route markers.
5. `Gustlift`
   Battle use: wind move with turn-order or repositioning value.
   Exploration use: crosses wind gaps, spins turbine gates, and powers sky lifts.
6. `Cliffspring`
   Battle use: leap or impact move with mobility flavor.
   Exploration use: climbs marked ledges, root walls, and broken terraces.

### Gating Rule
- Field abilities should never feel like arbitrary locks.
- Every gate must reinforce place, invite later return, and reward memory of earlier paths.

## 9. Prototype Content Scope
- 1 hometown
- 6 to 8 towns or cities
- 10 to 14 routes
- 3 to 5 dungeons
- 40 to 80 original creatures for prototype scope, with a strong regional ecology spread
- 3 starter lines minimum, each with full evolution support
- 8 leaders
- 1 elite challenge
- 1 rival arc with recurring battles and growth beats
- 1 antagonist faction arc that intersects with exploration spaces
- 80 to 120 moves if the team can support it cleanly; fewer is acceptable if system polish stays high

### Prototype Quality Bar
- Clarity over complexity
- Team composition over twitch skill
- Strong sense of place over sheer map count
- Constant nearby goals over vague long-term grind
- Resource pressure on routes so towns matter

## 10. Playable Vertical Slice Specification
### Goal
Deliver a 30 to 60 minute vertical slice that proves the game’s identity, not just its rendering or battle math.

### Required Slice Content
- Opening scene in `Loma Claro`
- Starter choice among `Flameling`, `Brookit`, and `Mosslet`
- Codex introduction and first capture-device tutorial
- One early route with wild encounters, at least 3 trainer battles, hidden items, and a shortcut
- `Bahia Brisa` as the first full service town with healing, shopping, and storage
- `Bosque Solseta` as the first dense hazard zone with at least 6 wild species, one rival fight, and one antagonist scout event
- A functional codex with Seen/Caught tracking and habitat notes
- Party management with a real 6-creature limit
- Storage access in town only
- Turn-based battles with type advantage, status effects, switching, healing items, capture devices, and trainer no-run logic
- One complete first leader battle that teaches matchup strategy and awards `Shearvine`

### Minimum Content For The Slice
- 12 to 18 total creatures
- 18 to 30 moves
- 3 starter species plus 9 to 15 regional creatures
- 1 leader
- 1 rival battle
- 1 antagonist encounter chain
- 3 connected explorable areas plus one town hub

### Success Criteria
- The player clearly feels the loop of explore -> encounter -> weaken -> catch -> train -> return -> challenge.
- The party limit changes decision-making.
- The region feels authored and worth revisiting.
- The first badge victory feels like a true milestone because it unlocks both progression and traversal.
- The game feels spiritually adjacent to a classic handheld monster JRPG while standing as its own world, voice, and identity.
