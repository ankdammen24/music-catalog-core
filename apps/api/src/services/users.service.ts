import { supabase } from '../lib/supabase.js';

export const usersService = {
  async me(clerkUserId: string) { return (await supabase.from('users').select('*').eq('clerk_user_id', clerkUserId).single()).data; },
  async sync(clerkUserId: string, email?: string) {
    const existing = await this.me(clerkUserId);
    if (existing) return existing;
    return (await supabase.from('users').insert({ clerk_user_id: clerkUserId, email, role: 'listener' }).select('*').single()).data;
  }
};
