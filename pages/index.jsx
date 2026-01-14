import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    if (text) formData.append('text', text);
    if (file) formData.append('media', file);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
        setText('');
        setFile(null);
      } else {
        alert('发送失败');
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>发布校园新闻</h1>
      {success && <p style={{ color: 'green' }}>✅ 发布成功！</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="写下你想分享的内容..."
          rows="4"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '10px' }}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? '发送中...' : '发布'}
        </button>
      </form>
    </div>
  );
}
