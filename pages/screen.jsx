import { useEffect, useState } from 'react';

export default function Screen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        // 触发浏览量 +1
        data.forEach(post => {
          fetch(`/api/views/${post.id}`, { method: 'PATCH' });
        });
        setPosts(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 15000); // 每 15 秒刷新
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#000',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem' }}>校园动态大屏</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
        {posts.map(post => (
          <div key={post.id} style={{
            background: '#111',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {post.text && <p style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{post.text}</p>}
            {post.media_url && (
              post.media_url.endsWith('.mp4') || post.media_url.endsWith('.mov') ?
                <video src={post.media_url} controls width="100%" style={{ borderRadius: '8px' }} /> :
                <img src={post.media_url} alt="" style={{ width: '100%', borderRadius: '8px' }} />
            )}
            <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '0.9rem', color: '#aaa' }}>
              👁️ {post.views} 次浏览
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
