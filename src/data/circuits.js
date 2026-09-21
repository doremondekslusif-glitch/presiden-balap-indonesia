const makeCircuit = (
  id,
  name,
  location,
  laps,
  width,
  lapLength,
  points,
  theme
) => ({
  id,
  name,
  location,
  laps,
  width,
  lapLength,
  points,
  theme
});

export const circuits = [
  makeCircuit(
    'bali-circuit',
    'Bali Circuit',
    'Bali · Pesisir Tropis',
    3,
    12,
    240,
    [
      [-52, 0, -8],
      [-44, 0, -30],
      [-20, 0, -42],
      [10, 0, -40],
      [38, 0, -27],
      [52, 0, -5],
      [48, 0, 18],
      [30, 0, 36],
      [2, 0, 43],
      [-27, 0, 36],
      [-48, 0, 19],
      [-56, 0, 4]
    ],
    'bali'
  ),

  makeCircuit(
    'nusantara-ring',
    'Nusantara Ring',
    'Kalimantan · Hutan Nusantara',
    3,
    11,
    255,
    [
      [-58, 0, 2],
      [-52, 0, -22],
      [-34, 0, -39],
      [-8, 0, -48],
      [20, 0, -45],
      [45, 0, -30],
      [58, 0, -8],
      [52, 0, 14],
      [35, 0, 34],
      [8, 0, 46],
      [-20, 0, 42],
      [-43, 0, 29],
      [-57, 0, 12]
    ],
    'forest'
  ),

  makeCircuit(
    'garuda-speedway',
    'Garuda Speedway',
    'Jakarta · Sirkuit Kota',
    3,
    13,
    270,
    [
      [-62, 0, -24],
      [-35, 0, -39],
      [0, 0, -42],
      [35, 0, -36],
      [60, 0, -20],
      [65, 0, 2],
      [57, 0, 24],
      [35, 0, 39],
      [3, 0, 43],
      [-30, 0, 37],
      [-55, 0, 24],
      [-66, 0, 5],
      [-66, 0, -10]
    ],
    'city'
  ),

  makeCircuit(
    'merapi-mountain',
    'Merapi Mountain',
    'Yogyakarta · Jalur Gunung',
    3,
    10,
    245,
    [
      [-52, 0, 8],
      [-47, 0, -16],
      [-32, 0, -36],
      [-8, 0, -47],
      [18, 0, -43],
      [39, 0, -29],
      [49, 0, -8],
      [43, 0, 12],
      [29, 0, 26],
      [12, 0, 37],
      [-8, 0, 48],
      [-31, 0, 42],
      [-47, 0, 27],
      [-56, 0, 17]
    ],
    'mountain'
  ),

  makeCircuit(
    'raja-ampat-coast',
    'Raja Ampat Coast',
    'Papua Barat · Kepulauan',
    3,
    12,
    260,
    [
      [-58, 0, -5],
      [-48, 0, -28],
      [-25, 0, -43],
      [3, 0, -48],
      [30, 0, -39],
      [52, 0, -22],
      [61, 0, 0],
      [53, 0, 22],
      [32, 0, 39],
      [5, 0, 48],
      [-23, 0, 43],
      [-45, 0, 29],
      [-59, 0, 12]
    ],
    'island'
  )
];

export const baliCircuit = circuits[0];
