export const TYPE_CHART = {
  Fire: { Leaf: 1.4, Water: 0.7, Stone: 0.8 },
  Water: { Fire: 1.4, Stone: 1.2, Leaf: 0.7 },
  Leaf: { Water: 1.4, Stone: 1.1, Fire: 0.7, Wind: 0.9 },
  Stone: { Fire: 1.2, Wind: 1.3, Water: 0.8, Leaf: 0.9 },
  Wind: { Leaf: 1.2, Stone: 0.8 },
  Normal: {},
};

export function getTypeModifier(attackType, defenseType) {
  return TYPE_CHART[attackType]?.[defenseType] ?? 1;
}
