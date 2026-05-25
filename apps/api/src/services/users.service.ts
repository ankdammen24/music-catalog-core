import { supabase } from '../lib/supabase.js';

const USER_FIELDS = 'id,clerk_user_id,email,role,artist_id';

export const usersService = {
  async me(externalUserId: string) {
    return (await supabase.from('users').select(USER_FIELDS).eq('clerk_user_id', externalUserId).single()).data;
  },
  async sync(externalUserId: string, email?: string) {
    const existing = await this.me(externalUserId);
    if (existing) {
      if (email && existing.email !== email) {
        return (await supabase.from('users').update({ email }).eq('id', existing.id).select(USER_FIELDS).single()).data;
      }
      return existing;
    }
    return (await supabase.from('users').insert({ clerk_user_id: externalUserId, email, role: 'listener' }).select(USER_FIELDS).single()).data;
  }
};
