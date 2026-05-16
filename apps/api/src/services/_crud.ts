import { supabase } from '../lib/supabase.js';

export const crudService = (table: string) => ({
  list: async () => (await supabase.from(table).select('*')).data,
  get: async (id: string) => (await supabase.from(table).select('*').eq('id', id).single()).data,
  create: async (payload: Record<string, unknown>) => (await supabase.from(table).insert(payload).select('*').single()).data,
  update: async (id: string, payload: Record<string, unknown>) => (await supabase.from(table).update(payload).eq('id', id).select('*').single()).data,
  remove: async (id: string) => supabase.from(table).delete().eq('id', id)
});
