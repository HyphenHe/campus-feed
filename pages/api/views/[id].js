import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;
  const { data, error } = await supabase
    .from('posts')
    .update({ views: supabase.rpc('increment', { col: 'views', val: 1 }) })
    .eq('id', id)
    .select('views');

  if (error) return res.status(500).json({ error: 'Failed to update views' });
  res.json(data[0]);
}
