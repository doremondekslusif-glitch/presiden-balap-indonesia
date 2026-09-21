const makeCircuit = (id, name, location, laps, width, points, theme) => ({
  id,
  name,
  location,
  laps,
  width,
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
    [
      [-36,0,-8],[-27,0,-27],[-4,0,-34],[23,0,-28],
      [38,0,-8],[34,0,13],[17,0,28],[-8,0,31],
      [-29,0,20],[-40,0,5]
    ],
    'bali'
  ),

  makeCircuit(
    'nusantara-ring',
    'Nusantara Ring',
    'Kalimantan · Hutan Nusantara',
    3,
    11,
    [
      [-45,0,-2],[-38,0,-22],[-20,0,-35],[7,0,-40],
      [31,0,-29],[45,0,-8],[42,0,14],[24,0,32],
      [-3,0,39],[-29,0,29],[-46,0,13],[-51,0,4]
    ],
    'forest'
  ),

  makeCircuit(
    'garuda-speedway',
    'Garuda Speedway',
    'Jakarta · Sirkuit Kota',
    3,
    13,
    [
      [-48,0,-18],[-28,0,-31],[2,0,-32],[29,0,-23],
      [49,0,-8],[50,0,10],[35,0,25],[8,0,31],
      [-18,0,28],[-42,0,16],[-51,0,0]
    ],
    'city'
  ),

  makeCircuit(
    'merapi-mountain',
    'Merapi Mountain',
    'Yogyakarta · Jalur Gunung',
    3,
    10,
    [
      [-40,0,4],[-34,0,-18],[-18,0,-31],[5,0,-38],
      [26,0,-29],[38,0,-12],[30,0,5],[15,0,19],
      [0,0,34],[-24,0,29],[-43,0,17],[-48,0,8]
    ],
    'mountain'
  ),

  makeCircuit(
    'raja-ampat-coast',
    'Raja Ampat Coast',
    'Papua Barat · Kepulauan',
    3,
    12,
    [
      [-46,0,-6],[-35,0,-28],[-9,0,-39],[18,0,-35],
      [41,0,-20],[48,0,1],[37,0,20],[12,0,36],
      [-14,0,34],[-35,0,21],[-50,0,8]
    ],
    'island'
  )
];

export const baliCircuit = circuits[0];
