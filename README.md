# Pokemon Boricua Engine

This build adds trainer logic to the overworld NPC system.

## Added in this build

- trainer NPCs with live sight cones
- trainer detection when the player enters line of sight
- alert beat before the trainer moves in
- approach movement to close distance before battle
- trainer battle handoff using the existing battle scene
- defeated trainer tracking so rematches do not auto-trigger
- trainer battles now block escape attempts

## Trainer behavior model

The engine now distinguishes between:
- **regular NPCs** for dialogue and ambient movement
- **trainer NPCs** with sight range, intro dialogue, and battle data

## Why this matters

This is the first real bridge between the world layer and battle layer:
- spatial placement matters
- facing direction matters
- route planning matters
- NPC identity now has gameplay consequences

## Controls

- Move: Arrow keys / WASD
- Interact: Space / Enter
- Battle: 1-3 moves, 4 run, T tonic
