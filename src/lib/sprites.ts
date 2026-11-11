const POKEAPI_SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';

export function pokemonSprite(dex: number): string {
  return `${POKEAPI_SPRITES}/pokemon/${dex}.png`;
}
