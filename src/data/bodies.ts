import type { BodyData, SolarSystemData } from './types';

const deg = (d: number): number => (d * Math.PI) / 180;

function planet(
  id: string,
  name: string,
  radiusKm: number,
  orbitalDistanceKm: number,
  orbitalPeriodDays: number,
  rotationPeriodHours: number,
  opts: {
    sizeUnits: number;
    orbitRadiusUnits: number;
    orbitTilt?: number;
    rotationSpeed?: number;
    orbitSpeed?: number;
    moons?: string[];
    hasRings?: boolean;
    atmosphere?: boolean;
    atmosphereDesc?: string;
    description: string;
    funFact?: string;
    asset?: BodyData['asset'];
  },
): BodyData {
  return {
    id,
    name,
    type: 'planet',
    radiusKm,
    orbitalDistanceKm,
    orbitalPeriodDays,
    rotationPeriodHours,
    moons: opts.moons ?? [],
    hasRings: opts.hasRings ?? false,
    atmosphere: {
      present: opts.atmosphere ?? false,
      description: opts.atmosphereDesc ?? 'None.',
    },
    description: opts.description,
    funFact: opts.funFact,
    asset: opts.asset ?? {},
    visual: {
      sizeUnits: opts.sizeUnits,
      orbitRadiusUnits: opts.orbitRadiusUnits,
      orbitTilt: { x: 0, y: 0, z: opts.orbitTilt ?? 0 },
      rotationSpeed: opts.rotationSpeed ?? 0.2,
      orbitSpeed: opts.orbitSpeed ?? Math.max(0.05, 0.5 / orbitalPeriodDays),
    },
  };
}

function moon(
  id: string,
  name: string,
  parent: string,
  radiusKm: number,
  orbitalDistanceKm: number,
  orbitalPeriodDays: number,
  opts: {
    sizeUnits: number;
    orbitRadiusUnits: number;
    atmosphere?: boolean;
    description: string;
    funFact?: string;
  },
): BodyData {
  return {
    id,
    name,
    type: 'moon',
    parent,
    radiusKm,
    orbitalDistanceKm,
    orbitalPeriodDays,
    rotationPeriodHours: orbitalPeriodDays * 24,
    moons: [],
    hasRings: false,
    atmosphere: {
      present: opts.atmosphere ?? false,
      description: opts.atmosphere ? 'Thin atmosphere present.' : 'None.',
    },
    description: opts.description,
    funFact: opts.funFact,
    asset: {},
    visual: {
      sizeUnits: opts.sizeUnits,
      orbitRadiusUnits: opts.orbitRadiusUnits,
      orbitTilt: { x: 0, y: 0, z: deg(10) },
      rotationSpeed: 0.1,
      orbitSpeed: Math.max(0.1, 0.2 / orbitalPeriodDays),
    },
  };
}

export const SOLAR_SYSTEM: SolarSystemData = {
  sun: {
    id: 'sun',
    name: 'Sun',
    type: 'sun',
    radiusKm: 696340,
    orbitalDistanceKm: 0,
    orbitalPeriodDays: 0,
    rotationPeriodHours: 609.12,
    moons: [],
    hasRings: false,
    atmosphere: { present: true, description: 'The Sun is a main-sequence G-type star.' },
    description:
      'The Sun is the star at the center of our solar system. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.',
    funFact: 'The Sun contains 99.86% of the mass of the entire solar system.',
    asset: { colorMap: 'textures/sun/color.jpg' },
    visual: {
      sizeUnits: 6,
      orbitRadiusUnits: 0,
      orbitTilt: { x: 0, y: 0, z: 0 },
      rotationSpeed: 0.05,
      orbitSpeed: 0,
    },
  },

  planets: [
    planet('mercury', 'Mercury', 2439.7, 57910000, 88, 1407.6, {
      sizeUnits: 0.6,
      orbitRadiusUnits: 9,
      rotationSpeed: 0.15,
      orbitSpeed: 0.9,
      description:
        'Mercury is the smallest planet and the closest to the Sun. It has no atmosphere and a heavily cratered surface resembling the Moon.',
      funFact: 'A year on Mercury is just 88 Earth days.',
      asset: { colorMap: 'textures/mercury/color.jpg' },
    }),
    planet('venus', 'Venus', 6051.8, 108200000, 225, 5832.5, {
      sizeUnits: 0.85,
      orbitRadiusUnits: 12,
      rotationSpeed: 0.08,
      orbitSpeed: 0.7,
      atmosphere: true,
      atmosphereDesc: 'Thick, toxic carbon dioxide atmosphere with clouds of sulfuric acid.',
      description:
        'Venus is the hottest planet in the solar system due to a runaway greenhouse effect. It spins in the opposite direction to most planets.',
      funFact: 'Venus rotates backwards and a day is longer than its year.',
      asset: { colorMap: 'textures/venus/color.jpg' },
    }),
    planet('earth', 'Earth', 6371, 149600000, 365.25, 24, {
      sizeUnits: 0.9,
      orbitRadiusUnits: 15,
      rotationSpeed: 0.6,
      orbitSpeed: 0.55,
      moons: ['moon'],
      atmosphere: true,
      atmosphereDesc: 'Nitrogen-oxygen atmosphere that supports life and dynamic weather.',
      description:
        'Earth is the third planet from the Sun and the only known world to harbor life. About 71% of its surface is covered with water.',
      funFact: 'Earth is the only planet not named after a Greek or Roman deity.',
      asset: { colorMap: 'textures/earth/color.jpg' },
    }),
    planet('mars', 'Mars', 3389.5, 227900000, 687, 24.6, {
      sizeUnits: 0.65,
      orbitRadiusUnits: 18,
      rotationSpeed: 0.55,
      orbitSpeed: 0.45,
      atmosphere: true,
      atmosphereDesc: 'Thin carbon dioxide atmosphere with polar ice caps and dust storms.',
      description:
        'Mars is the fourth planet from the Sun, known for its red, iron-rich surface. It hosts the largest volcano and canyon in the solar system.',
      funFact: 'Mars has two small moons, Phobos and Deimos.',
      asset: { colorMap: 'textures/mars/color.jpg' },
    }),
    planet('jupiter', 'Jupiter', 69911, 778600000, 4333, 9.9, {
      sizeUnits: 2.4,
      orbitRadiusUnits: 24,
      rotationSpeed: 0.7,
      orbitSpeed: 0.35,
      moons: ['io', 'europa', 'ganymede', 'callisto'],
      atmosphere: true,
      atmosphereDesc: 'Mostly hydrogen and helium with distinctive banded clouds and the Great Red Spot.',
      description:
        'Jupiter is the largest planet in the solar system, a gas giant with dozens of moons. Its Great Red Spot is a storm larger than Earth.',
      funFact: 'Jupiter has the shortest day of all planets, about 10 hours.',
      asset: { colorMap: 'textures/jupiter/color.jpg' },
    }),
    planet('saturn', 'Saturn', 58232, 1433500000, 10759, 10.7, {
      sizeUnits: 2.1,
      orbitRadiusUnits: 30,
      rotationSpeed: 0.65,
      orbitSpeed: 0.28,
      moons: ['titan'],
      hasRings: true,
      atmosphere: true,
      atmosphereDesc: 'Mainly hydrogen and helium with remarkable ring system of ice particles.',
      description:
        'Saturn is the sixth planet from the Sun, best known for its spectacular ring system made of ice and rock, and its many moons including Titan.',
      funFact: 'Saturn is the least dense planet; it would float in water.',
      asset: {
        colorMap: 'textures/saturn/color.jpg',
        ringMap: 'textures/saturn/ring.png',
      },
    }),
    planet('uranus', 'Uranus', 25362, 2871000000, 30687, 17.2, {
      sizeUnits: 1.5,
      orbitRadiusUnits: 36,
      rotationSpeed: 0.4,
      orbitSpeed: 0.22,
      hasRings: true,
      atmosphere: true,
      atmosphereDesc: 'Hydrogen, helium and methane giving it a pale cyan color.',
      description:
        'Uranus is the seventh planet from the Sun, an ice giant that rotates on its side with faint rings and a pale blue color from methane.',
      funFact: 'Uranus rotates on its side at nearly 98 degrees.',
      asset: { colorMap: 'textures/uranus/color.jpg' },
    }),
    planet('neptune', 'Neptune', 24622, 4495000000, 60190, 16.1, {
      sizeUnits: 1.4,
      orbitRadiusUnits: 42,
      rotationSpeed: 0.4,
      orbitSpeed: 0.18,
      moons: ['triton'],
      atmosphere: true,
      atmosphereDesc: 'Hydrogen, helium and methane with the fastest winds in the solar system.',
      description:
        'Neptune is the eighth and most distant planet from the Sun, a deep blue ice giant with the strongest winds and a large dark storm.',
      funFact: 'Neptune has the fastest winds of any planet, over 2,000 km/h.',
      asset: { colorMap: 'textures/neptune/color.jpg' },
    }),
  ],

  moons: [
    moon('moon', 'Earth\'s Moon', 'earth', 1737.4, 384400, 27.3, {
      sizeUnits: 0.25,
      orbitRadiusUnits: 1.6,
      description: 'Earth\'s only natural satellite, responsible for tides and stabilizing our axial tilt.',
      funFact: 'The Moon is drifting about 3.8 cm farther from Earth every year.',
    }),
    moon('io', 'Io', 'jupiter', 1821.6, 421700, 1.8, {
      sizeUnits: 0.3,
      orbitRadiusUnits: 3.4,
      description: 'The most volcanically active body in the solar system.',
      funFact: 'Io has over 400 active volcanoes.',
    }),
    moon('europa', 'Europa', 'jupiter', 1560.8, 671034, 3.6, {
      sizeUnits: 0.28,
      orbitRadiusUnits: 4.3,
      description: 'An icy moon with a subsurface ocean that may harbor life.',
      funFact: 'Europa\'s ocean may contain twice the water of all Earth\'s oceans.',
    }),
    moon('ganymede', 'Ganymede', 'jupiter', 2634.1, 1070412, 7.2, {
      sizeUnits: 0.42,
      orbitRadiusUnits: 5.2,
      description: 'The largest moon in the solar system, larger than the planet Mercury.',
      funFact: 'Ganymede is the only moon with its own magnetic field.',
    }),
    moon('callisto', 'Callisto', 'jupiter', 2410.3, 1882700, 16.7, {
      sizeUnits: 0.38,
      orbitRadiusUnits: 6.0,
      description: 'A heavily cratered, ancient icy world.',
      funFact: 'Callisto has the oldest, most cratered surface in the solar system.',
    }),
    moon('titan', 'Titan', 'saturn', 2574.7, 1221870, 15.9, {
      sizeUnits: 0.45,
      orbitRadiusUnits: 4.8,
      atmosphere: true,
      description: 'Saturn\'s largest moon with a thick atmosphere and lakes of liquid methane.',
      funFact: 'Titan has rivers and lakes of liquid methane and ethane.',
    }),
    moon('triton', 'Triton', 'neptune', 1353.4, 354759, 5.9, {
      sizeUnits: 0.34,
      orbitRadiusUnits: 4.2,
      atmosphere: true,
      description: 'Neptune\'s largest moon, orbiting in the opposite direction to its planet.',
      funFact: 'Triton has nitrogen geysers and orbits backwards.',
    }),
  ],
};
