const makeCircuit = (id, name, laps, width, points) => ({
  id,
  name,
  laps,
  width,
  points
});

export const circuits = [
  makeCircuit(
    'bali-circuit',
    'Bali Circuit',
    3,
    12,
    [
      [-36,0,-8],[-27,0,-27],[-4,0,-34],[23,0,-28],
      [38,0,-8],[34,0,13],[17,0,28],[-8,0,31],
      [-29,0,20],[-40,0,5]
    ]
  ),

  makeCircuit(
    'nusantara-ring',
    'Nusantara Ring',
    3,
    11,
    [
      [-42,0,-4],[-34,0,-25],[-10,0,-37],[18,0,-34],
      [40,0,-18],[43,0,5],[31,0,25],[5,0,36],
      [-21,0,32],[-40,0,17],[-47,0,5]
    ]
  ),

  makeCircuit(
    'garuda-speedway',
    'Garuda Speedway',
    3,
    13,
    [
      [-48,0,-15],[-25,0,-30],[4,0,-29],[30,0,-18],
      [47,0,-3],[39,0,17],[16,0,29],[-14,0,27],
      [-38,0,18],[-50,0,3]
    ]
  )
];

export const baliCircuit = circuits[0];
