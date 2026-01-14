import { supabase } from '../../lib/supabase';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      let mediaUrl = null;
      const text = fields.text ? fields.text[0] : '';

      if (files.media && files.media[0]) {
        const file = files.media[0];
        // 读取文件内容
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
      // 清理临时文件（如果 formidable 生成了）
      if (files.media && files.media[0]) {
        fs.unlink(files.media[0].filepath, () => {});
      }
    }
  });
}
