import { API_BASE_URL } from '../config';
import { fetchPokemonJapaneseName } from './pokemonSpecies';
import type { FlavorTextEntry } from './common.type';

export type PokemonDetailData = {
  id: number;
  name: string;
  japaneseName: string;
  image: string;
  description: string;
  types: string[];
  abilities: string[];
  baseStats: { name: string; value: number }[];
};

/**
 * fetchPokemonDetail
 * - returns a compact, typed Pokemon detail object
 * - uses `fetchPokemonJapaneseName` helper for the Japanese name
 * - keeps additional per-stat fetches out to avoid extra network overhead
 */
export const fetchPokemonDetail = async (id: number): Promise<PokemonDetailData> => {
  const res = await fetch(`${API_BASE_URL}/pokemon/${id}`);
  if (!res.ok) throw new Error('ポケモン詳細の取得に失敗しました');
  const data = await res.json();

  // species (for description / flavor text)
  const speciesRes = await fetch(`${API_BASE_URL}/pokemon-species/${id}`);
  let description = '';
  if (speciesRes.ok) {
    const species = await speciesRes.json();
    const flavor: FlavorTextEntry | undefined = species.flavor_text_entries?.find(
      (e: any) => e.language?.name === 'ja'
    );
    description = flavor ? flavor.flavor_text.replace(/\n|\f/g, ' ') : '';
  }

  // Japanese name (helper handles fetching and parsing)
  const japaneseName = await fetchPokemonJapaneseName(`${API_BASE_URL}/pokemon-species/${id}`);

  const detail: PokemonDetailData = {
    id: data.id,
    name: data.name,
    japaneseName,
    image:
      data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '',
    description,
    types: Array.isArray(data.types) ? data.types.map((t: any) => t.type.name) : [],
    abilities: Array.isArray(data.abilities)
      ? data.abilities.map((a: any) => a.ability.name)
      : [],
    baseStats: Array.isArray(data.stats)
      ? data.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat }))
      : [],
  };

  return detail;
};
