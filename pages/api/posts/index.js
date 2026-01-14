import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('views', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch posts' });
  res.json(data);
}
