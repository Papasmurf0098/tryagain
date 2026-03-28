function rows(...lines) {
  return lines.map((line) => line.split(''));
}

export const MAPS = {
  'island-start': {
    key: 'island-start',
    name: 'Isla Primer Paso',
    width: 26,
    height: 18,
    encounters: [{ key: 'Mosshell' }, { key: 'Tidepaw' }, { key: 'Pebblit' }, { key: 'Zephyroo' }],
    warps: [{ x: 21, y: 15, toMapKey: 'coast-cove', toX: 3, toY: 13 }],
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
          introScript: [
            { speaker: 'Niko', text: 'You crossed my sight line. That means a trainer battle!' },
          ],
          defeatedScript: [
            { speaker: 'Niko', text: 'Okay, okay—you read the field better than I do.' },
          ],
        },
      },
    ],
    tiles: rows(
      '##########################',
      '#..........tt.......ggggg#',
      '#..ggg.....tt.......ggggg#',
      '#..ggg..............ggggg#',
      '#..............#####.....#',
      '#..............#~~~#.....#',
      '#..tt..........#~~~#.....#',
      '#..tt...........~~~......#',
      '#.............gggggg.....#',
      '#....s........gggggg.....#',
      '#.............gggggg..tt.#',
      '#......#####............t#',
      '#......#...#.........tttt#',
      '#......#...#.............#',
      '#..........#....gggg.....#',
      '#..........#....gggg..w..#',
      '#......................t.#',
      '##########################',
    ),
  },
  'coast-cove': {
    key: 'coast-cove',
    name: 'Bahia Brisa',
    width: 24,
    height: 16,
    encounters: [{ key: 'Tidepaw' }, { key: 'Zephyroo' }, { key: 'Mosshell' }],
    warps: [{ x: 2, y: 13, toMapKey: 'island-start', toX: 20, toY: 15 }],
    interactions: [
      {
        x: 15,
        y: 3,
        type: 'sign',
        script: [
          { speaker: 'Marker', text: 'Bahia Brisa: prototype coast zone. Good place to test additional encounter tables.' },
        ],
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
          introScript: [
            { speaker: 'Guardia Sol', text: 'Hold it right there. Coastal patrol means coastal battles too.' },
          ],
          defeatedScript: [
            { speaker: 'Guardia Sol', text: 'Strong handling. I can let you pass with confidence now.' },
          ],
        },
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
    ],
    tiles: rows(
      '########################',
      '#...gggg......ttt......#',
      '#...gggg......ttt......#',
      '#..............s.......#',
      '#...........~~~~~~.....#',
      '#...........~~~~~~.....#',
      '#....tt.....~~~~~~.....#',
      '#....tt................#',
      '#.............gggg.....#',
      '#.............gggg.....#',
      '#....#####.............#',
      '#....#...#.............#',
      '#....#...#.............#',
      '#.w....................#',
      '#..............tt......#',
      '########################',
    ),
  },
};
