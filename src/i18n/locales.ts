import type { BodyData } from '../data/types';

export type Locale = 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es'];

/** UI string keys. The dictionary for each locale maps these to text. */
export type UIKey =
  | 'loadingTitle'
  | 'returnToSystem'
  | 'motionPause'
  | 'motionResume'
  | 'errorTitle'
  | 'errorRetry'
  | 'reload'
  | 'webglNotSupported'
  | 'webglMessage'
  | 'failedToStart'
  | 'overviewHint'
  | 'kindPlanet'
  | 'kindStar'
  | 'kindMoon'
  | 'moonsCount'
  | 'confirmed'
  | 'shownCount'
  | 'rings'
  | 'statRadius'
  | 'statOrbitalDistance'
  | 'statOrbitalPeriod'
  | 'statRotationPeriod'
  | 'statRings'
  | 'statMoons'
  | 'noneShown'
  | 'statAtmosphere'
  | 'starMeta'
  | 'atmospherePresent'
  | 'noAtmosphere'
  | 'yes'
  | 'days'
  | 'hours'
  | 'unitMillionKm'
  | 'unitBillionKm'
  | 'unitThousandKm'
  | 'unitKm';

/** Localized display text for a body (overrides the canonical English data). */
export interface BodyTranslation {
  name: string;
  description: string;
  funFact?: string;
  atmosphere?: string;
}

type UIStrings = Record<Locale, Record<UIKey, string>>;
type BodyStrings = Record<Locale, Record<string, BodyTranslation>>;

export const UI_STRINGS: UIStrings = {
  en: {
    loadingTitle: 'Loading Solar System…',
    returnToSystem: '← Solar System',
    motionPause: 'Pause',
    motionResume: 'Resume',
    errorTitle: 'Something went wrong',
    errorRetry: 'Retry',
    reload: 'Reload',
    webglNotSupported: 'WebGL is not supported',
    webglMessage:
      'Your browser does not support WebGL, which is required to render the interactive 3D Solar System.',
    failedToStart: 'Failed to start',
    overviewHint: 'Drag to rotate · scroll to zoom · hover a planet, click for detail',
    kindPlanet: 'Planet',
    kindStar: 'Star',
    kindMoon: 'Moon',
    moonsCount: '{n} moons',
    confirmed: 'confirmed',
    shownCount: 'showing {n}',
    rings: 'rings',
    statRadius: 'Radius',
    statOrbitalDistance: 'Orbital distance',
    statOrbitalPeriod: 'Orbital period',
    statRotationPeriod: 'Rotation period',
    statRings: 'Rings',
    statMoons: 'Moons',
    noneShown: 'None shown',
    statAtmosphere: 'Atmosphere',
    starMeta: 'Star · Main-sequence (G-type)',
    atmospherePresent: 'Atmosphere present',
    noAtmosphere: 'No significant atmosphere',
    yes: 'Yes',
    days: 'days',
    hours: 'hours',
    unitMillionKm: 'million km',
    unitBillionKm: 'billion km',
    unitThousandKm: 'thousand km',
    unitKm: 'km',
  },
  es: {
    loadingTitle: 'Cargando el sistema solar…',
    returnToSystem: '← Sistema Solar',
    motionPause: 'Pausar',
    motionResume: 'Reanudar',
    errorTitle: 'Algo salió mal',
    errorRetry: 'Reintentar',
    reload: 'Recargar',
    webglNotSupported: 'WebGL no es compatible',
    webglMessage:
      'Tu navegador no admite WebGL, que es necesario para mostrar el sistema solar 3D interactivo.',
    failedToStart: 'No se pudo iniciar',
    overviewHint:
      'Arrastra para rotar · rueda para hacer zoom · pasa el mouse por un planeta y haz clic para ver el detalle',
    kindPlanet: 'Planeta',
    kindStar: 'Estrella',
    kindMoon: 'Luna',
    moonsCount: '{n} lunas',
    confirmed: 'confirmadas',
    shownCount: 'mostrando {n}',
    rings: 'anillos',
    statRadius: 'Radio',
    statOrbitalDistance: 'Distancia orbital',
    statOrbitalPeriod: 'Período orbital',
    statRotationPeriod: 'Período de rotación',
    statRings: 'Anillos',
    statMoons: 'Lunas',
    noneShown: 'No se muestran',
    statAtmosphere: 'Atmósfera',
    starMeta: 'Estrella · Secuencia principal (tipo G)',
    atmospherePresent: 'Atmósfera presente',
    noAtmosphere: 'Sin atmósfera significativa',
    yes: 'Sí',
    days: 'días',
    hours: 'horas',
    unitMillionKm: 'millones de km',
    unitBillionKm: 'mil millones de km',
    unitThousandKm: 'miles de km',
    unitKm: 'km',
  },
};

/** Spanish translations for body names, descriptions, fun facts and atmosphere. */
export const BODY_STRINGS: BodyStrings = {
  es: {
    sun: {
      name: 'El Sol',
      description:
        'El Sol es la estrella en el centro de nuestro sistema solar. Es una esfera casi perfecta de plasma caliente, incandescente por las reacciones de fusión nuclear en su núcleo.',
      funFact: 'El Sol contiene el 99.86% de la masa de todo el sistema solar.',
      atmosphere: 'El Sol es una estrella de secuencia principal de tipo G.',
    },
    mercury: {
      name: 'Mercurio',
      description:
        'Mercurio es el planeta más pequeño y el más cercano al Sol. No tiene atmósfera y su superficie, repleta de cráteres, se asemeja a la Luna.',
      funFact: 'Un año en Mercurio dura solo 88 días terrestres.',
    },
    venus: {
      name: 'Venus',
      description:
        'Venus es el planeta más caliente del sistema solar debido a un efecto invernadero descontrolado. Gira en dirección contraria a la mayoría de los planetas.',
      funFact: 'Venus gira al revés y su día dura más que su año.',
      atmosphere: 'Atmósfera espesa y tóxica de dióxido de carbono con nubes de ácido sulfúrico.',
    },
    earth: {
      name: 'Tierra',
      description:
        'La Tierra es el tercer planeta desde el Sol y el único mundo conocido que alberga vida. Alrededor del 71% de su superficie está cubierta de agua.',
      funFact: 'La Tierra es el único planeta que no lleva el nombre de una deidad griega o romana.',
      atmosphere: 'Atmósfera de nitrógeno y oxígeno que sustenta la vida y un clima dinámico.',
    },
    mars: {
      name: 'Marte',
      description:
        'Marte es el cuarto planeta desde el Sol, conocido por su superficie roja rica en hierro. Alberga el volcán y el cañón más grandes del sistema solar.',
      funFact: 'Marte tiene dos pequeñas lunas, Fobos y Deimos.',
      atmosphere: 'Atmósfera delgada de dióxido de carbono con casquetes polares y tormentas de polvo.',
    },
    jupiter: {
      name: 'Júpiter',
      description:
        'Júpiter es el planeta más grande del sistema solar, un gigante gaseoso con decenas de lunas. Su Gran Mancha Roja es una tormenta más grande que la Tierra.',
      funFact: 'Júpiter tiene el día más corto de todos los planetas, de unas 10 horas.',
      atmosphere: 'Compuesta sobre todo de hidrógeno y helio, con nubes en bandas distintivas y la Gran Mancha Roja.',
    },
    saturn: {
      name: 'Saturno',
      description:
        'Saturno es el sexto planeta desde el Sol, famoso por su espectacular sistema de anillos de hielo y roca, y por sus muchas lunas, incluida Titán.',
      funFact: 'Saturno es el planeta menos denso; flotaría en el agua.',
      atmosphere: 'Principalmente hidrógeno y helio, con un notable sistema de anillos de partículas de hielo.',
    },
    uranus: {
      name: 'Urano',
      description:
        'Urano es el séptimo planeta desde el Sol, un gigante de hielo que rota de costado, con anillos tenues y un color azul pálido debido al metano.',
      funFact: 'Urano rota de costado, casi a 98 grados.',
      atmosphere: 'Hidrógeno, helio y metano, lo que le da un color cian pálido.',
    },
    neptune: {
      name: 'Neptuno',
      description:
        'Neptuno es el octavo y más lejano planeta del Sol, un gigante de hielo azul profundo con los vientos más fuertes y una gran tormenta oscura.',
      funFact: 'Neptuno tiene los vientos más rápidos de cualquier planeta, superiores a 2,000 km/h.',
      atmosphere: 'Hidrógeno, helio y metano, con los vientos más rápidos del sistema solar.',
    },
    moon: {
      name: 'La Luna',
      description:
        'El único satélite natural de la Tierra, responsable de las mareas y de estabilizar nuestra inclinación axial.',
      funFact: 'La Luna se aleja de la Tierra unos 3.8 cm cada año.',
    },
    io: {
      name: 'Ío',
      description: 'El cuerpo más volcánicamente activo del sistema solar.',
      funFact: 'Ío tiene más de 400 volcanes activos.',
    },
    europa: {
      name: 'Europa',
      description:
        'Una luna helada con un océano subterráneo que podría albergar vida.',
      funFact: 'El océano de Europa podría contener el doble de agua que todos los océanos de la Tierra.',
    },
    ganymede: {
      name: 'Ganímedes',
      description:
        'La luna más grande del sistema solar, más grande que el planeta Mercurio.',
      funFact: 'Ganímedes es la única luna con su propio campo magnético.',
    },
    callisto: {
      name: 'Calisto',
      description: 'Un mundo helado antiguo y repleto de cráteres.',
      funFact: 'Calisto tiene la superficie más antigua y con más cráteres del sistema solar.',
    },
    titan: {
      name: 'Titán',
      description:
        'La luna más grande de Saturno, con una atmósfera espesa y lagos de metano líquido.',
      funFact: 'Titán tiene ríos y lagos de metano y etano líquidos.',
      atmosphere: 'La luna más grande de Saturno, con una atmósfera espesa y lagos de metano líquido.',
    },
    triton: {
      name: 'Tritón',
      description:
        'La luna más grande de Neptuno, que orbita en dirección contraria a su planeta.',
      funFact: 'Tritón tiene géiseres de nitrógeno y orbita al revés.',
      atmosphere: 'La luna más grande de Neptuno, con géiseres de nitrógeno.',
    },
  },
  en: {},
};

/** Body auto-translations derived from the canonical English data (used for 'en'). */
export function bodyFromData(body: BodyData): BodyTranslation {
  return {
    name: body.name,
    description: body.description,
    funFact: body.funFact,
    atmosphere: body.atmosphere.description,
  };
}
