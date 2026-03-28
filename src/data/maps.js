function rows(...lines) {
  return lines.map((line) => line.split(''));
}

export const MAPS = {
  'island-start': {
    key: 'island-start',
    name: 'Isla Primer Paso',
    width: 34,
    height: 22,
    battleBackdropKey: 'island-meadow',
    encounterRate: 0.15,
    encounters: [
      { key: 'Mosshell', weight: 5, minLevel: 3, maxLevel: 5 },
      { key: 'Pebblit', weight: 3, minLevel: 4, maxLevel: 6 },
      { key: 'Zephyroo', weight: 2, minLevel: 4, maxLevel: 6 },
      { key: 'Cindroe', weight: 2, minLevel: 5, maxLevel: 7 },
      { key: 'Thistleaf', weight: 1, minLevel: 5, maxLevel: 7 },
    ],
    warps: [
      { x: 9, y: 14, toMapKey: 'primer-cottage', toX: 8, toY: 9, kind: 'door', facing: 'up', arrivalText: 'Primer Cottage' },
    ],
    connections: [
      { edge: 'right', start: 14, end: 16, toMapKey: 'coast-cove', toX: 1, toY: 13, kind: 'route', facing: 'right', arrivalText: 'Sea road to Bahia Brisa' },
      { edge: 'down', start: 27, end: 29, toMapKey: 'sunspore-grove', toX: 28, toY: 1, kind: 'route', facing: 'down', arrivalText: 'Canopy trail to Bosque Solseta' },
    ],
    interactions: [
      {
        x: 5,
        y: 9,
        type: 'sign',
        script: [
          { speaker: 'Shrine', text: 'Build the engine first. Regions, quests, and battles will scale from that core.' },
          { speaker: 'Shrine', text: 'A modular project lets you add maps, creatures, and UI without breaking old systems.' },
        ],
      },
      {
        x: 17,
        y: 20,
        type: 'sign',
        script: [
          { speaker: 'Lookout', text: 'Longer routes need visual rhythm: grass breaks, tree clusters, and landmarks so bigger maps stay readable.' },
        ],
      },
      {
        x: 27,
        y: 20,
        type: 'sign',
        script: [
          { speaker: 'Trail Marker', text: 'Sendero sur: Bosque Solseta ahead. The route now spills naturally into the next map instead of dropping you onto a warp pad.' },
        ],
      },
      {
        id: 'primer-paso-satchel',
        x: 20,
        y: 16,
        type: 'pickup',
        label: 'Trail Satchel',
        foundText: 'A weathered satchel was tucked beside the ridge grass.',
        itemKey: 'tonic',
        amount: 1,
        money: 18,
      },
    ],
    npcs: [
      {
        id: 'tano',
        name: 'Tano',
        x: 6,
        y: 9,
        facing: 'right',
        appearance: {
          skin: '#c9956a', hair: '#e7e2d5', shirt: '#5a7bc2', jacket: '#35558a', pants: '#49392f', shoes: '#201a16', accent: '#d8b56d', hairStyle: 'short', accessory: 'cane',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Tano', text: 'A village only feels alive when people occupy the paths, not just the map tiles.' },
          { speaker: 'Tano', text: 'Watch our steps. Some of us hold still, some patrol, and some wander within a home range.' },
        ],
      },
      {
        id: 'marisol',
        name: 'Marisol',
        x: 8,
        y: 10,
        facing: 'down',
        appearance: {
          skin: '#d4a07b', hair: '#2f1f1b', shirt: '#ef8f53', jacket: '#c85f2e', pants: '#2a4175', shoes: '#1a1b22', accent: '#f7d2a9', hairStyle: 'ponytail', accessory: 'satchel',
        },
        behavior: { type: 'patrol', route: ['right', 'right', 'left', 'left'], pause: 0.33 },
        script: [
          { speaker: 'Marisol', text: 'I keep the center path busy so the town does not feel frozen.' },
          { speaker: 'Marisol', text: 'Patrol routes are the cleanest first step for believable NPC life.' },
        ],
      },
      {
        id: 'luma',
        name: 'Luma',
        x: 18,
        y: 3,
        facing: 'left',
        appearance: {
          skin: '#f0c8a2', hair: '#3d2a19', shirt: '#6dbf7f', jacket: '#3d8a57', pants: '#674d8f', shoes: '#2b2138', accent: '#fff0c7', hairStyle: 'bun', accessory: 'scarf',
        },
        behavior: { type: 'wander', zone: { minX: 15, maxX: 20, minY: 1, maxY: 4 }, pause: 0.48 },
        script: [
          { speaker: 'Luma', text: 'I wander, but only within a little zone so I still belong to this part of town.' },
          { speaker: 'Luma', text: 'That keeps movement organic without letting NPCs drift into nonsense.' },
        ],
      },
      {
        id: 'ines',
        name: 'Ines',
        x: 27,
        y: 3,
        facing: 'left',
        appearance: {
          skin: '#ddb18e', hair: '#3a2216', shirt: '#7bd09f', jacket: '#34785c', pants: '#58416f', shoes: '#221a2b', accent: '#fdf2c9', hairStyle: 'long', accessory: 'badge',
        },
        behavior: { type: 'wander', zone: { minX: 24, maxX: 31, minY: 1, maxY: 4 }, pause: 0.44 },
        script: [
          { speaker: 'Ines', text: 'Bigger routes need finer texture passes. A few extra lines in grass and trees make the space feel authored.' },
        ],
      },
      {
        id: 'niko',
        name: 'Niko',
        x: 19,
        y: 13,
        facing: 'left',
        appearance: {
          skin: '#b98058', hair: '#12131b', shirt: '#e2d267', jacket: '#a8942d', pants: '#40616d', shoes: '#1d2629', accent: '#ff7a5b', hairStyle: 'cap', accessory: 'none',
        },
        behavior: { type: 'patrol', route: ['left', 'left', 'right', 'right'], pause: 0.38 },
        script: [
          { speaker: 'Niko', text: 'People notice motion before detail. Once pathing works, the world feels inhabited.' },
        ],
        trainer: {
          sightRange: 5,
          team: [{ key: 'Pebblit', level: 5 }],
          rewardMoney: 60,
          introScript: [
            { speaker: 'Niko', text: 'You crossed my sight line. That means a trainer battle!' },
          ],
          defeatedScript: [
            { speaker: 'Niko', text: 'Okay, okay—you read the field better than I do.' },
          ],
        },
      },
      {
        id: 'rian',
        name: 'Rian',
        x: 14,
        y: 15,
        facing: 'left',
        appearance: {
          skin: '#d4ab85', hair: '#162237', shirt: '#77a2ff', jacket: '#385ca6', pants: '#4f4338', shoes: '#16181f', accent: '#f9edb6', hairStyle: 'crest', accessory: 'satchel',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Rian', text: 'You finally made it out here. I wanted our first real match to happen on the road, not back in town.' },
        ],
        trainer: {
          sightRange: 4,
          dynamicTeam: 'rival-starter',
          level: 6,
          rewardMoney: 72,
          introScript: [
            { speaker: 'Rian', text: 'You picked your partner. I picked mine. Time to see whose choice carries harder in the field.' },
          ],
          defeatedScript: [
            { speaker: 'Rian', text: 'That was sharp. Good. If we keep pushing each other, neither of us stays ordinary for long.' },
          ],
        },
      },
      {
        id: 'oriel',
        name: 'Oriel',
        x: 28,
        y: 18,
        facing: 'left',
        appearance: {
          skin: '#c88961', hair: '#1a2230', shirt: '#efb15a', jacket: '#b56d2f', pants: '#325167', shoes: '#151d26', accent: '#ffe9b3', hairStyle: 'crest', accessory: 'satchel',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Oriel', text: 'Expanded routes deserve stronger pacing. You should have quiet stretches before a trainer snaps the tempo back up.' },
        ],
        trainer: {
          sightRange: 6,
          team: [{ key: 'Zephyroo', level: 7 }],
          rewardMoney: 84,
          introScript: [
            { speaker: 'Oriel', text: 'This new ridge is mine to test. Let us see how your timing holds up on a longer route.' },
          ],
          defeatedScript: [
            { speaker: 'Oriel', text: 'That landed clean. The bigger route is doing its job if battles feel earned.' },
          ],
        },
      },
    ],
    tiles: rows(
      '##################################',
      '#..........tt.......ggggg..tt....#',
      '#..ggg.....tt.......ggggg..ttggg.#',
      '#..ggg..............ggggg...gggg.#',
      '#..............#####.......#####.#',
      '#..............#~~~#........#~~~.#',
      '#..tt..........#~~~#.....tt.#~~~.#',
      '#..tt...........~~~......tt..~~~.#',
      '#.............gggggg........gggg.#',
      '#....s........gggggg......gggggg.#',
      '#.............gggggg..tt....tttt.#',
      '#......rrrrr............t....ttt.#',
      '#......rbbbr.........tttt..tttt..#',
      '#......bbbbb................ggg..#',
      '#......bbdbb....gggg.......gggg..#',
      '#...............gggg.......gggg..#',
      '#......................t....tt...#',
      '#.........tt....gggg....tt.......#',
      '#....ggg..tt....gggg....tt..ggg..#',
      '#....ggg..............tt....ggg..#',
      '#.........gggg...s.tttt..........#',
      '##################################',
    ),
  },
  'coast-cove': {
    key: 'coast-cove',
    name: 'Bahia Brisa',
    width: 32,
    height: 20,
    battleBackdropKey: 'coast-shore',
    encounterRate: 0.17,
    encounters: [
      { key: 'Tidepaw', weight: 5, minLevel: 4, maxLevel: 7 },
      { key: 'Driftail', weight: 4, minLevel: 5, maxLevel: 7 },
      { key: 'Zephyroo', weight: 3, minLevel: 4, maxLevel: 6 },
      { key: 'Mosshell', weight: 2, minLevel: 4, maxLevel: 6 },
      { key: 'Flintusk', weight: 1, minLevel: 6, maxLevel: 8 },
    ],
    warps: [
      { x: 7, y: 12, toMapKey: 'harbor-house', toX: 8, toY: 9, kind: 'door', facing: 'up', arrivalText: 'Harbor House' },
    ],
    connections: [
      { edge: 'left', start: 13, end: 13, toMapKey: 'island-start', toX: 32, toY: 15, kind: 'route', facing: 'left', arrivalText: 'Sea road to Primer Paso' },
      { edge: 'right', start: 15, end: 15, toMapKey: 'sunspore-grove', toX: 1, toY: 4, kind: 'route', facing: 'right', arrivalText: 'Trail into Bosque Solseta' },
    ],
    interactions: [
      {
        x: 15,
        y: 3,
        type: 'sign',
        script: [
          { speaker: 'Marker', text: 'Bahia Brisa: prototype coast zone. Good place to test additional encounter tables.' },
        ],
      },
      {
        x: 16,
        y: 15,
        type: 'sign',
        script: [
          { speaker: 'Marker', text: 'The cove now opens into a wider shoreline. More room means softer pacing between patrols and encounters.' },
        ],
      },
      {
        x: 25,
        y: 15,
        type: 'sign',
        script: [
          { speaker: 'Harbor Post', text: 'The inland turnoff leads toward Bosque Solseta. Expect grass ambushes, glowcaps, and tougher route fights.' },
        ],
      },
      {
        id: 'brisa-dock-bundle',
        x: 21,
        y: 6,
        type: 'pickup',
        label: 'Dock Bundle',
        foundText: 'A supply wrap was tied beneath the harbor railing.',
        itemKey: 'snareOrb',
        amount: 2,
      },
      {
        x: 12,
        y: 13,
        type: 'healer',
        script: [
          { speaker: 'Harbor Nurse', text: 'Take a breath. Your field party is fully restored and ready for the next route.' },
        ],
      },
      {
        x: 13,
        y: 13,
        type: 'storage-terminal',
      },
      {
        x: 14,
        y: 13,
        type: 'codex-kiosk',
      },
    ],
    npcs: [
      {
        id: 'berto',
        name: 'Berto',
        x: 7,
        y: 13,
        facing: 'up',
        appearance: {
          skin: '#d0a37b', hair: '#4b3427', shirt: '#5aa0c9', jacket: '#2e6380', pants: '#48505e', shoes: '#222831', accent: '#f9e2ad', hairStyle: 'beanie', accessory: 'satchel',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Berto', text: 'Stationary NPCs matter too. Anchors make moving characters easier to read.' },
        ],
      },
      {
        id: 'sol',
        name: 'Guardia Sol',
        x: 18,
        y: 11,
        facing: 'left',
        appearance: {
          skin: '#9f6d49', hair: '#11131a', shirt: '#c46666', jacket: '#7f3131', pants: '#33485b', shoes: '#171d24', accent: '#d7dbe0', hairStyle: 'short', accessory: 'badge',
        },
        behavior: { type: 'patrol', route: ['up', 'up', 'down', 'down'], pause: 0.32 },
        script: [
          { speaker: 'Guardia Sol', text: 'My route is short on purpose. Tight patrol loops read clearly in small maps.' },
        ],
        trainer: {
          sightRange: 4,
          team: [{ key: 'Tidepaw', level: 6 }],
          rewardMoney: 72,
          introScript: [
            { speaker: 'Guardia Sol', text: 'Hold it right there. Coastal patrol means coastal battles too.' },
          ],
          defeatedScript: [
            { speaker: 'Guardia Sol', text: 'Strong handling. I can let you pass with confidence now.' },
          ],
        },
      },
      {
        id: 'paz',
        name: 'Paz',
        x: 27,
        y: 8,
        facing: 'left',
        appearance: {
          skin: '#f1c7a4', hair: '#6a3d26', shirt: '#8dd0e6', jacket: '#3b7b95', pants: '#4d615d', shoes: '#1c2421', accent: '#fdf5cb', hairStyle: 'ponytail', accessory: 'scarf',
        },
        behavior: { type: 'wander', zone: { minX: 24, maxX: 29, minY: 7, maxY: 10 }, pause: 0.47 },
        script: [
          { speaker: 'Paz', text: 'A bigger coast should not feel empty. Grass pockets and wandering silhouettes keep the route alive.' },
        ],
      },
      {
        id: 'cora',
        name: 'Cora',
        x: 12,
        y: 8,
        facing: 'right',
        appearance: {
          skin: '#efc7a6', hair: '#7a4626', shirt: '#8f78cf', jacket: '#6248a7', pants: '#3f5d49', shoes: '#1d221f', accent: '#f4f0ff', hairStyle: 'long', accessory: 'scarf',
        },
        behavior: { type: 'wander', zone: { minX: 8, maxX: 17, minY: 7, maxY: 11 }, pause: 0.52 },
        script: [
          { speaker: 'Cora', text: 'Human silhouettes need hair, shoulders, arms, and leg separation. Otherwise they read like props.' },
        ],
      },
      {
        id: 'nima',
        name: 'Nima',
        x: 17,
        y: 13,
        facing: 'left',
        appearance: {
          skin: '#efc49c', hair: '#4d2e25', shirt: '#f4af67', jacket: '#bf6a36', pants: '#48627a', shoes: '#17202b', accent: '#fff3c9', hairStyle: 'short', accessory: 'satchel',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Nima', text: 'Snare Orbs work best once a wild creature is worn down. Low HP means a steadier catch.' },
          { speaker: 'Nima', text: 'If your field party is already full, the harbor terminal stores the capture for you. The codex still records it either way.' },
        ],
      },
      {
        id: 'rio',
        name: 'Rio',
        x: 24,
        y: 15,
        facing: 'right',
        appearance: {
          skin: '#b98058', hair: '#11131a', shirt: '#7fdc9a', jacket: '#2f8b62', pants: '#355070', shoes: '#15202b', accent: '#f9e8b3', hairStyle: 'short', accessory: 'badge',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Rio', text: 'You cannot just stretch a route. You need a new focal point, a fresh trainer, and a better silhouette break.' },
        ],
        trainer: {
          sightRange: 5,
          team: [{ key: 'Mosshell', level: 7 }],
          rewardMoney: 84,
          introScript: [
            { speaker: 'Rio', text: 'New shoreline, new checkpoint. Let us see if your team reads the terrain as well as you do.' },
          ],
          defeatedScript: [
            { speaker: 'Rio', text: 'That was sharp. The wider cove finally feels worthy of a proper patrol battle.' },
          ],
        },
      },
    ],
    tiles: rows(
      '################################',
      '#...gggg......ttt........tt....#',
      '#...gggg......ttt........tt....#',
      '#..............s..........tt...#',
      '#...........~~~~~~.......~~~~..#',
      '#...........~~~~~~.......~~~~..#',
      '#....tt.....~~~~~~.......~~~~..#',
      '#....tt....................ttt.#',
      '#.............gggg.......gggg..#',
      '#.............gggg.......gggg..#',
      '#....rrrrr.................rrr.#',
      '#....bbbbb.................bbb.#',
      '#....bbdbb.................bbb.#',
      '#...........sss..........gggg..#',
      '#..............tt........tt....#',
      '#......gggg.....s....tt........#',
      '#......gggg.....~~~~.tt....ggg.#',
      '#...............~~~~......gggg.#',
      '#....tt....................ggg.#',
      '################################',
    ),
  },
  'sunspore-grove': {
    key: 'sunspore-grove',
    name: 'Bosque Solseta',
    width: 36,
    height: 22,
    battleBackdropKey: 'grove-canopy',
    encounterRate: 0.19,
    encounters: [
      { key: 'Thistleaf', weight: 5, minLevel: 6, maxLevel: 9 },
      { key: 'Cindroe', weight: 4, minLevel: 6, maxLevel: 8 },
      { key: 'Flintusk', weight: 3, minLevel: 6, maxLevel: 9 },
      { key: 'Mosshell', weight: 3, minLevel: 5, maxLevel: 8 },
      { key: 'Zephyroo', weight: 2, minLevel: 6, maxLevel: 8 },
    ],
    warps: [],
    connections: [
      { edge: 'up', start: 27, end: 29, toMapKey: 'island-start', toX: 28, toY: 20, kind: 'route', facing: 'up', arrivalText: 'Back toward Primer Paso' },
      { edge: 'left', start: 4, end: 4, toMapKey: 'coast-cove', toX: 30, toY: 15, kind: 'route', facing: 'left', arrivalText: 'Back toward Bahia Brisa' },
    ],
    fieldGates: [
      {
        id: 'sunspore-bramble',
        x: 18,
        y: 11,
        abilityKey: 'shearvine',
        abilityLabel: 'Shearvine',
        label: 'Thorn Wall',
        tile: 'v',
        clearedTile: '.',
        blockedScript: [
          {
            type: 'say',
            speaker: 'Thorn Wall',
            text: 'Dense thornvines choke the trail. Leader Marza said Shearvine can cut growth like this back to a walkable line.',
          },
        ],
        clearedScript: [
          {
            type: 'say',
            speaker: 'Thorn Wall',
            text: 'Shearvine slices the brambles apart, opening a cleaner route into the grove.',
          },
        ],
      },
    ],
    interactions: [
      {
        x: 10,
        y: 11,
        type: 'sign',
        script: [
          { speaker: 'Trail Sign', text: 'Bosque Solseta: a new inland segment where glowcap canopies and denser grass change the whole battle mood.' },
        ],
      },
      {
        id: 'sunspore-glowcap-cache',
        x: 18,
        y: 17,
        type: 'pickup',
        label: 'Glowcap Cache',
        foundText: 'You find a dry pouch hidden beneath the glowcap roots.',
        itemKey: 'tonic',
        amount: 1,
        money: 36,
      },
    ],
    npcs: [
      {
        id: 'yara',
        name: 'Yara',
        x: 12,
        y: 11,
        facing: 'right',
        appearance: {
          skin: '#d1a27d', hair: '#3b2419', shirt: '#e8c65f', jacket: '#b78f2c', pants: '#4f5b74', shoes: '#1e2430', accent: '#fff0c2', hairStyle: 'bun', accessory: 'scarf',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Yara', text: 'A new route segment should not just be more tiles. It needs a different silhouette, a new battle mood, and creatures you do not see elsewhere.' },
        ],
      },
      {
        id: 'mimo',
        name: 'Mimo',
        x: 27,
        y: 15,
        facing: 'left',
        appearance: {
          skin: '#efc49c', hair: '#523423', shirt: '#7fd67f', jacket: '#3e8751', pants: '#4f3d6d', shoes: '#1d1f26', accent: '#fff4d4', hairStyle: 'long', accessory: 'satchel',
        },
        behavior: { type: 'wander', zone: { minX: 22, maxX: 32, minY: 12, maxY: 18 }, pause: 0.4 },
        script: [
          { speaker: 'Mimo', text: 'This grove is meant to surprise you. The route loops tighter, the grass is thicker, and the creature mix gets weirder.' },
        ],
      },
      {
        id: 'selva',
        name: 'Selva',
        x: 23,
        y: 12,
        facing: 'left',
        appearance: {
          skin: '#b98058', hair: '#16202a', shirt: '#d97757', jacket: '#8a4132', pants: '#2d4c3f', shoes: '#161f18', accent: '#ffd7b6', hairStyle: 'ponytail', accessory: 'badge',
        },
        behavior: { type: 'patrol', route: ['left', 'left', 'right', 'right'], pause: 0.34 },
        script: [
          { speaker: 'Selva', text: 'If a route gets deeper, battles should too. I guard the grove entrance for trainers who think expansion means easy filler.' },
        ],
        trainer: {
          sightRange: 5,
          team: [{ key: 'Thistleaf', level: 8 }],
          rewardMoney: 96,
          introScript: [
            { speaker: 'Selva', text: 'You made it into Bosque Solseta. That earns you a proper route battle.' },
          ],
          defeatedScript: [
            { speaker: 'Selva', text: 'Good read. The new grove finally has the pressure it needed.' },
          ],
        },
      },
    ],
    tiles: rows(
      '####################################',
      '#....tt........gggg....tt..........#',
      '#....tt....gggggggg....tt...gggg...#',
      '#.........gggggggggg........gggg...#',
      '#.........ggg....ggg.....tt........#',
      '#.........ggg....ggg.....tt........#',
      '#....tt...ggg....ggg..~~~~~~~~.....#',
      '#....tt...ggg....ggg..~~~~~~~~.....#',
      '#.........gggggggggg..~~....~~.....#',
      '#......tt....gggg..................#',
      '#......tt....gggg.....tttt.........#',
      '#.........s..gggg.....tttt.........#',
      '#....gggg..................gggg....#',
      '#....gggg....rrrrr.........gggg....#',
      '#............rbbbr....tt...........#',
      '#....tt......bbbbb....tt....gggg...#',
      '#....tt......bbbbb....gggggggggg...#',
      '#.....................gggggggggg...#',
      '#.......tt.............gggg..tt....#',
      '#.......tt....~~~~~~~~.gggg..tt....#',
      '#.............~~~~~~~~.............#',
      '####################################',
    ),
  },
  'primer-cottage': {
    key: 'primer-cottage',
    name: 'Primer Cottage',
    width: 20,
    height: 12,
    battleBackdropKey: 'island-meadow',
    encounterRate: 0,
    encounters: [],
    warps: [
      { x: 8, y: 10, toMapKey: 'island-start', toX: 9, toY: 15, kind: 'door', facing: 'down', arrivalText: 'Isla Primer Paso' },
    ],
    interactions: [],
    npcs: [
      {
        id: 'tala',
        name: 'Tala',
        x: 10,
        y: 5,
        facing: 'left',
        appearance: {
          skin: '#ddb18e', hair: '#5e3d2a', shirt: '#e0ba69', jacket: '#976d2f', pants: '#50617a', shoes: '#241d20', accent: '#fff1be', hairStyle: 'bun', accessory: 'scarf',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Tala', text: 'Leaving home should still feel grounded. A small interior with books, plants, and a warm floor makes the town feel lived in.' },
          { speaker: 'Tala', text: 'Routes connect more cleanly now too. When you cross the edge, the region should feel stitched together instead of teleported.' },
        ],
      },
    ],
    tiles: rows(
      '#'.repeat(20),
      '###' + 'b' + '.'.repeat(7) + 'sbb' + '#'.repeat(6),
      '###' + '.' + 's'.repeat(10) + '.' + '#'.repeat(5),
      '###' + '.' + 's'.repeat(10) + '.' + '#'.repeat(5),
      '###' + '.'.repeat(5) + 's'.repeat(2) + '.'.repeat(5) + 's' + '#'.repeat(4),
      '###' + '.'.repeat(3) + 'b'.repeat(2) + '.'.repeat(2) + 'b'.repeat(2) + '.'.repeat(4) + '#'.repeat(4),
      '###' + '.'.repeat(5) + 's'.repeat(2) + '.'.repeat(6) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(5) + 'd' + '.'.repeat(7) + '#'.repeat(4),
      '#'.repeat(20),
    ),
  },
  'harbor-house': {
    key: 'harbor-house',
    name: 'Harbor House',
    width: 20,
    height: 12,
    battleBackdropKey: 'coast-shore',
    encounterRate: 0,
    encounters: [],
    warps: [
      { x: 8, y: 10, toMapKey: 'coast-cove', toX: 7, toY: 13, kind: 'door', facing: 'down', arrivalText: 'Bahia Brisa' },
    ],
    interactions: [
      {
        x: 5,
        y: 2,
        type: 'healer',
        script: [
          { speaker: 'Harbor Nurse', text: 'Welcome inside. The house services are clustered under one roof so the port reads like a real stopover.' },
        ],
      },
      {
        x: 7,
        y: 2,
        type: 'shop-counter',
      },
      {
        x: 10,
        y: 2,
        type: 'storage-terminal',
      },
      {
        x: 14,
        y: 2,
        type: 'codex-kiosk',
      },
    ],
    npcs: [
      {
        id: 'esme',
        name: 'Esme',
        x: 6,
        y: 6,
        facing: 'right',
        appearance: {
          skin: '#efc7a4', hair: '#443127', shirt: '#73aed4', jacket: '#336f91', pants: '#48536a', shoes: '#1d2430', accent: '#fff2c7', hairStyle: 'ponytail', accessory: 'satchel',
        },
        behavior: { type: 'stationary' },
        script: [
          { speaker: 'Esme', text: 'A port house should feel stocked, not empty. Counters, shelves, rugs, and terminals turn utility into place.' },
        ],
      },
      {
        id: 'marza',
        name: 'Leader Marza',
        x: 14,
        y: 6,
        facing: 'left',
        appearance: {
          skin: '#c58c67', hair: '#433127', shirt: '#d7c47a', jacket: '#7a5e35', pants: '#415468', shoes: '#1d232c', accent: '#f9efbf', hairStyle: 'short', accessory: 'badge',
        },
        behavior: { type: 'stationary' },
        script: [
          {
            type: 'ifFlag',
            key: 'defeatedTrainers.marza',
            then: [
              {
                type: 'say',
                speaker: 'Marza',
                text: 'The coast tests patience before power. Bosque Solseta has a thorn wall waiting for your new clearance.',
              },
            ],
            else: [
              {
                type: 'ifFlag',
                key: 'harborShopVisited',
                then: [
                  {
                    type: 'say',
                    speaker: 'Marza',
                    text: 'Good. You stocked up before asking for a badge. Stone teams punish careless routes, so let us see what your lead partner understands.',
                  },
                  {
                    type: 'startTrainerBattle',
                    trainerId: 'marza',
                    trainerName: 'Leader Marza',
                    team: [{ key: 'Pebblit', level: 9 }],
                    rewardMoney: 120,
                  },
                  {
                    type: 'branchLastBattle',
                    won: [
                      { type: 'awardBadge', badgeKey: 'coast', badgeName: 'Coast Badge' },
                      { type: 'unlockAbility', abilityKey: 'shearvine' },
                      {
                        type: 'say',
                        speaker: 'Marza',
                        text: 'That was disciplined. Take the Coast Badge, and with it the Shearvine field clearance. Bosque Solseta has a bramble wall that will answer to it.',
                      },
                    ],
                    lost: [
                      {
                        type: 'say',
                        speaker: 'Marza',
                        text: 'You have the nerve. Come back when your team can hold the shoreline a little longer.',
                      },
                    ],
                  },
                ],
                else: [
                  {
                    type: 'say',
                    speaker: 'Marza',
                    text: 'A badge battle starts before the first turn. Use the Harbor House counter, settle your supplies, and then come face me properly.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    tiles: rows(
      '#'.repeat(20),
      '###' + 'b' + '.'.repeat(7) + 'sbb' + '#'.repeat(6),
      '###' + '.' + 'c'.repeat(4) + '.' + 'c'.repeat(3) + '.' + 'c'.repeat(3) + '#'.repeat(4),
      '###' + '.' + 's'.repeat(10) + '.' + '#'.repeat(5),
      '###' + '.'.repeat(5) + 's'.repeat(2) + '.'.repeat(6) + '#'.repeat(4),
      '###' + '.'.repeat(3) + 'b'.repeat(2) + '.'.repeat(2) + 'b'.repeat(2) + '.'.repeat(4) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(13) + '#'.repeat(4),
      '###' + '.'.repeat(5) + 'd' + '.'.repeat(7) + '#'.repeat(4),
      '#'.repeat(20),
    ),
  },
};
