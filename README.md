# Pokemon Boricua Engine

Pokemon Boricua Engine is a browser-based RPG prototype with a modular scene-driven structure. This build includes overworld exploration, trainer encounters, and turn-based battles while keeping the code split into focused engine layers.

## Project Layout

```text
.
├── index.html
├── README.md
├── styles/
│   └── main.css
└── src/
    ├── main.js
    ├── core/
    │   ├── config.js
    │   ├── game.js
    │   ├── input.js
    │   ├── physics.js
    │   ├── state.js
    │   └── utils.js
    ├── data/
    │   ├── creatures.js
    │   ├── maps.js
    │   ├── moves.js
    │   └── types.js
    ├── rendering/
    │   ├── canvasDisplay.js
    │   ├── entities.js
    │   ├── tiles.js
    │   └── ui.js
    ├── scenes/
    │   ├── BattleScene.js
    │   └── OverworldScene.js
    └── systems/
        ├── assetSystem.js
        ├── battleSystem.js
        ├── dialogueSystem.js
        ├── npcSystem.js
        └── saveSystem.js
```

## Current Features

- overworld movement with keyboard controls
- dialogue and map interactions
- trainer NPC sight cones and encounter flow
- turn-based battles with creature stats, moves, healing, and escape rules
- save/load support through browser localStorage

## Local Run

Serve the repo root with any static file server, then open the served `index.html`.

Example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

- Move: Arrow keys / WASD
- Interact: Space / Enter
- Battle select: 1-4
