import { API_BASE_URL } from '../config';
import { fetchPokemonJapaneseName } from './pokemonSpecies';
// no type imports required here

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

export const fetchPokemonDetail = async (id: number): Promise<PokemonDetailData> => {
  const res = await fetch(`${API_BASE_URL}/pokemon/${id}`);
  if (!res.ok) throw new Error('ポケモン詳細の取得に失敗しました');
  const data = await res.json();

  const speciesRes = await fetch(`${API_BASE_URL}/pokemon-species/${id}`);
  let description = '';
  if (speciesRes.ok) {
    const species = await speciesRes.json();
    const flavor = species.flavor_text_entries?.find((e: any) => e.language?.name === 'ja');
    description = flavor ? flavor.flavor_text.replace(/\n|\f/g, ' ') : '';
  }

  const japaneseName = await fetchPokemonJapaneseName(`${API_BASE_URL}/pokemon-species/${id}`);

  const detail: PokemonDetailData = {
    id: data.id,
    name: data.name,
    japaneseName,
    image: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '',
    description,
    types: data.types?.map((t: any) => t.type.name) || [],
    abilities: data.abilities?.map((a: any) => a.ability.name) || [],
    baseStats: data.stats?.map((s: any) => ({ name: s.stat.name, value: s.base_stat })) || [],
  };

  return detail;
};
