import { supabase } from '../lib/supabase.js';

const USER_FIELDS = 'id,clerk_user_id,email,role,artist_id';

export const usersService = {
  async me(clerkUserId: string) {
    return (await supabase.from('users').select(USER_FIELDS).eq('clerk_user_id', clerkUserId).single()).data;
  },
  async sync(clerkUserId: string, email?: string) {
    const existing = await this.me(clerkUserId);
    if (existing) {
      if (email && existing.email !== email) {
        return (await supabase.from('users').update({ email }).eq('id', existing.id).select(USER_FIELDS).single()).data;
      }
      return existing;
    }
    return (await supabase.from('users').insert({ clerk_user_id: clerkUserId, email, role: 'listener' }).select(USER_FIELDS).single()).data;
  }
};
