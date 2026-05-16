import { supabase } from '../lib/supabase.js';
import { crudService } from './_crud.js';

export const tracksService = {
  ...crudService('tracks'),
  async list(query: {
    page?: number;
    pageSize?: number;
    status?: string;
    artist_id?: string;
    album_id?: string;
    rights_status?: string;
    processing_status?: string;
    search?: string;
  }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let req = supabase.from('tracks').select('*', { count: 'exact' }).range(from, to);
    if (query.status) req = req.eq('status', query.status);
    if (query.artist_id) req = req.eq('artist_id', query.artist_id);
    if (query.album_id) req = req.eq('album_id', query.album_id);
    if (query.rights_status) req = req.eq('rights_status', query.rights_status);
    if (query.processing_status) req = req.eq('processing_status', query.processing_status);
    if (query.search) req = req.ilike('title', `%${query.search}%`);
    const { data, count } = await req;
    return { items: data ?? [], page, pageSize, total: count ?? 0 };
  }
};
