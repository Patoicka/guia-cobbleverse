/**
 * Contenido de texto que en la versión HTML vivía directo en el marcado
 * (no en arreglos de datos): recetas de cocina, Mega/Dynamax/Z y la ruta.
 */

export interface CookRecipe {
  id: string;
  title: string;
  subtitle: string;
  sprite: string;
  summary: string;
  attracts: boolean;
  /** Cuadrícula 3×3 de la Olla, fila por fila */
  grid?: [string, string, string][];
  steps: { label: string; text: string }[];
}

export const COOK_RECIPES: CookRecipe[] = [
  {
    id: 'poke-snack',
    title: 'Poké Snack',
    subtitle: 'El cebo que se pone en el suelo',
    sprite: 'poke-snack',
    attracts: true,
    summary:
      'Se coloca en el suelo y los Pokémon salvajes aparecen alrededor y le dan una mordida. Aguanta 9 mordidas y se acaba. Se apila de 16 en 16.',
    grid: [
      ['Leche', 'Leche', 'Leche'],
      ['Miel', 'Vivichoke', 'Miel'],
      ['Granos Abundantes', 'Granos Abundantes', 'Granos Abundantes'],
    ],
    steps: [
      { label: 'Leche', text: 'Cubo de leche o Leche Moomoo.' },
      {
        label: 'Condimentos',
        text: 'A la derecha, hasta 3 condimentos de cebo: son los que cambian qué Pokémon viene. Sin condimento, el snack atrae lo normal del bioma.',
      },
      {
        label: 'Ojo',
        text: 'El snack multiplica probabilidades, no rompe las reglas de aparición: un Pokémon de océano no va a salir en un desierto aunque pongas su baya. Bioma, hora y clima siguen mandando.',
      },
    ],
  },
  {
    id: 'poke-bait',
    title: 'Poké Bait',
    subtitle: 'El cebo de la caña',
    sprite: 'poke-bait',
    attracts: true,
    summary:
      'El hermano pescador del Poké Snack: se engancha a la Caña Pokémon (Poké Rod) como cebo y sus condimentos influyen en qué Pokémon pica.',
    steps: [
      {
        label: 'Receta sin forma',
        text: '1 botella de miel + 1 champiñón (rojo o marrón) + 1 trigo + hasta 3 condimentos de cebo, en la Olla. Salen 4 cebos por cocinada.',
      },
      {
        label: 'Bayas sueltas',
        text: 'Desde la actualización 1.6, las bayas se pueden enganchar directamente a la caña como cebo, cada una con su efecto.',
      },
    ],
  },
  {
    id: 'olla',
    title: 'Olla de fogata',
    subtitle: 'Campfire Pot: donde se cocina todo',
    sprite: 'olla',
    attracts: false,
    summary:
      'El bloque de cocina de Cobblemon. Se coloca sobre una fogata encendida y tiene la cuadrícula de cocina más 3 huecos de condimento a la derecha. También sirve como destilería temprana antes de llegar al Nether.',
    steps: [
      { label: 'Receta', text: '5 lingotes de cobre + 1 cristal + 2 Apricorns de cualquier color, en la mesa de crafteo.' },
      {
        label: 'El color',
        text: 'La olla sale del color de los Apricorns que uses (roja, azul, amarilla, verde, rosa, blanca o negra). Es solo estética.',
      },
      {
        label: 'Qué se cocina',
        text: 'Poké Snack, Poké Cake, Poké Bait, casi toda la comida, los mochis y los caramelos de hiperentrenamiento.',
      },
    ],
  },
  {
    id: 'poke-cake',
    title: 'Poké Cake',
    subtitle: 'Parece un Snack, pero no atrae nada',
    sprite: 'poke-cake',
    attracts: false,
    summary:
      'Es comida para ti, como un pastel de Minecraft. Cada rebanada restaura 2 de hambre (9 rebanadas: 18 en total). Su condimento solo cambia el color.',
    grid: [
      ['Leche', 'Leche', 'Leche'],
      ['Azúcar', 'Vivichoke', 'Azúcar'],
      ['Granos Abundantes', 'Granos Abundantes', 'Granos Abundantes'],
    ],
    steps: [],
  },
];

export const COOK_HOW = [
  'Los condimentos (seasoning) deciden qué viene: cada baya de tipo hace que los Pokémon de ese tipo sean 10 veces más probables. La wiki los divide en cuatro: de sabor (los absorbe el Aprijuice), de nutrición y de efecto (los absorben las comidas y dan efectos al jugador) y de cebo (los absorben el Poké Snack y el Poké Bait, y son los de atraer Pokémon). Cada receta solo absorbe el tipo que le toca.',
  'La regla de oro del cebo: la baya de un tipo hace a ese tipo 10 veces más probable entre lo que ya puede aparecer ahí. Combina: Poké Snack con Baya Haban en una cueva de montaña para dragones, o con Baya Starf si vas por shinies. Y apila efectos: la Olla deja poner 3 condimentos, así que tipo + shiny + rareza pueden ir en el mismo snack.',
];

export interface Mechanic {
  id: string;
  title: string;
  needs: [string, string];
  keyItem: string;
  unlock: string;
  use: string;
  /** Qué Pokémon de la guía mostrar como ejemplo */
  showcase: 'mega' | 'gmax' | null;
}

export const MECHANICS: Mechanic[] = [
  {
    id: 'mega',
    title: 'Megaevolución',
    keyItem: 'Pulsera Mega',
    needs: ['Pulsera Mega (objeto clave)', 'Megapiedra equipada'],
    unlock:
      'Necesitas una Pulsera Mega (Mega Bracelet) equipada y la megapiedra específica de cada especie (Charizardita X/Y, Gengarita, Lucarita…) equipada en el Pokémon. Las megapiedras salen como botín raro de estructuras, recompensas de gimnasios y jefes del modpack, y derrotando a ciertos Pokémon jefe.',
    use: 'En combate, activa la megaevolución antes de elegir movimiento. Dura todo el combate y solo puede megaevolucionar un Pokémon por batalla.',
    showcase: 'mega',
  },
  {
    id: 'dynamax',
    title: 'Dynamax y Gigamax',
    keyItem: 'Muñequera Dynamax',
    needs: ['Muñequera Dynamax (objeto clave)', 'Zona de energía Dynamax'],
    unlock:
      'Con la Muñequera Dynamax (Dynamax Band). El Dynamax solo se activa en zonas con energía de Dynamax del modpack (arenas de gimnasio y puntos de energía) y dura 3 turnos: el Pokémon crece, sube su salud y sus movimientos se vuelven movimientos Max.',
    use: 'Gigamax: solo algunos Pokémon con el factor Gigamax cambian de forma y obtienen un movimiento G-Max propio. Los Maxichampiñones y la Maxisopa dan el factor Gigamax a un Pokémon compatible donde está implementado.',
    showcase: 'gmax',
  },
  {
    id: 'z',
    title: 'Movimientos Z',
    keyItem: 'Pulsera Z',
    needs: ['Pulsera Z (objeto clave)', 'Cristal Z equipado'],
    unlock:
      'Con la Pulsera Z (Z-Ring) y un Cristal Z equipado en el Pokémon: uno por tipo (Firum Z para Fuego, Electrium Z para Eléctrico…) más los exclusivos de especie, como el Pikashunium Z de Pikachu o el Snorlium Z de Snorlax. Los cristales salen como botín de estructuras y recompensas del modpack.',
    use: 'Una vez por combate, convierte un movimiento del mismo tipo del cristal en un movimiento Z de potencia enorme.',
    showcase: null,
  },
];

export interface RouteStep {
  title: string;
  text: string;
  link?: { section: string; label: string };
}

export const ROUTE_STEPS: RouteStep[] = [
  {
    title: 'Elige inicial y haz tu granja de Apricorns',
    text: 'Planta los 7 colores de Apricorn junto a tu base y crea una fila de árboles: sin Apricorns no hay Poké Balls. De paso, siembra bayas curativas (Oran y Sitrus) para no depender de pociones.',
    link: { section: 'objetos', label: 'Ver recetas de Poké Balls' },
  },
  {
    title: 'Kit básico: mesa, Curador y PC',
    text: 'Craftea el Curador (Healer) y la PC cuanto antes. El Curador te ahorra viajes al pueblo y la PC es tu caja infinita de Pokémon. Añade una cama y un punto de reaparición seguro.',
    link: { section: 'objetos', label: 'Ver Máquinas y PC' },
  },
  {
    title: 'Arma un equipo equilibrado de 6',
    text: 'Cubre los tipos clave: algo contra Dragón (Hielo/Hada), Tierra para Eléctricos, Volador o Lucha para Normales, y un Pokémon con Falso Tortazo (False Swipe) y otro con Somnífero o Pararayo para capturar. Sube el equipo a nivel 35–45 explorando biomas variados.',
    link: { section: 'tipos', label: 'Abrir la calculadora de tipos' },
  },
  {
    title: 'Gimnasios y jefes del modpack',
    text: 'Recorre las aldeas y ciudades: los gimnasios de Cobbleverse escalan por medallas. Cada victoria suele pagar en MT, objetos de evolución o megapiedras. Revisa la calculadora de tipos antes de cada líder.',
  },
  {
    title: 'Evoluciones completas y piedras',
    text: 'Mina en cuevas profundas y en el Nether para completar el set de piedras evolutivas, consigue el Cable Link para las evoluciones por intercambio y usa los Caramelos Raros con cabeza: guárdalos para el último salto de los pseudolegendarios (Dratini y compañía piden nivel 55).',
    link: { section: 'evoluciones', label: 'Ver cómo evoluciona cada uno' },
  },
  {
    title: 'Endgame: legendarios y mecánicas',
    text: 'Con el equipo en 60+, ve por los santuarios y las apariciones legendarias, consigue la Pulsera Mega, la Muñequera Dynamax y la Pulsera Z, y completa la Pokédex capturando por bioma y horario.',
    link: { section: 'legendarios', label: 'Ver legendarios' },
  },
];

export const EXPLORE_TIP =
  'Los Pokémon tienen horarios: muchos Fantasma y Siniestro solo salen de noche, y varios de tipo Bicho y Planta al amanecer. Monta una base cerca de la unión de dos o tres biomas distintos (por ejemplo bosque + río + montaña) y multiplicas lo que puede aparecer sin caminar tanto.';

export const LEGEND_TIPS = [
  'Antes de pelear: lleva Ultra Balls y un Pokémon que duerma o paralice.',
  'La Master Ball no se puede craftear. Guárdala para un legendario que se te escape o un shiny que no quieras perder.',
];
