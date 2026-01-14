import { supabase } from '../../lib/supabase';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 处理 POST 请求（发帖）
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      try {
        let mediaUrl = null;
        const text = fields.text ? fields.text[0] : '';

        if (files.media && files.media[0]) {
          const file = files.media[0];
          const fileBuffer = await fs.promises.readFile(file.filepath);
          const fileName = `${Date.now()}-${file.originalFilename}`;
          
          const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, fileBuffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (error) throw error;
          const { publicUrl } = supabase.storage.from('media').getPublicUrl(fileName);
          mediaUrl = publicUrl.publicUrl;
        }

        const { data, error } = await supabase
          .from('posts')
          .insert([{ text, media_url: mediaUrl }])
          .select();

        if (error) throw error;
        res.status(201).json(data[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
      } finally {
        if (files.media && files.media[0]) {
          fs.unlink(files.media[0].filepath, () => {});
        }
      }
    });
  }
  // 处理 GET 请求（获取帖子列表）
  else if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('views', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch posts' });
    res.json(data);
  }
  // 其他方法返回 405
  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
