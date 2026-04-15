import crypto from 'crypto';
import supabase from '../lib/supabase.js';
import type { Character, CharacterInsert, CharacterUpdate } from '../types/database.js';

const uuid = () => crypto.randomUUID();

export const createCharacter = async (data: CharacterInsert) => {
  const { data: character, error } = await supabase
    .from('Character')
    .insert({ id: uuid(), ...data })
    .select('*')
    .single();

  if (error || !character) {
    throw new Error(error?.message || 'Failed to create character');
  }
  return character as Character;
};

export const getAllCharacters = async () => {
  const { data: characters, error } = await supabase
    .from('Character')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (characters || []) as Character[];
};

export const getCharacterById = async (id: string) => {
  const { data: character, error } = await supabase
    .from('Character')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return character as Character;
};

export const updateCharacter = async (id: string, data: CharacterUpdate) => {
  const { data: character, error } = await supabase
    .from('Character')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !character) {
    throw new Error(error?.message || 'Failed to update character');
  }
  return character as Character;
};

export const deleteCharacter = async (id: string) => {
  const { error } = await supabase
    .from('Character')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
  return { success: true };
};
