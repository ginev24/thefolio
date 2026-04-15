import { useState } from 'react'
import API from '../api/axios'  // ← palitan lang ito

export default function HeartButton({ postId, initialHearts, initialLiked }) {
  const [hearts, setHearts]   = useState(initialHearts ?? 0)
  const [liked, setLiked]     = useState(initialLiked ?? false)
  const [loading, setLoading] = useState(false)

  async function handleHeart() {
    if (loading) return
    setLoading(true)
    try {
      const { data } = await API.post(`/posts/${postId}/heart`)  // ← dito rin
      setHearts(data.hearts)
      setLiked(data.liked)
    } catch (err) {
      if (err.response?.status === 401)
        alert('Login muna para mag-react!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleHeart}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 16px', borderRadius: '999px',
        border: `1.5px solid ${liked ? '#e0095a' : '#aaa'}`,
        background: liked ? '#ffe4ef' : 'transparent',
        color: liked ? '#e0095a' : 'inherit',
        fontSize: '14px', cursor: 'pointer',
        transition: 'all .2s', fontWeight: '500'
      }}
    >
      {liked ? '❤️' : '🤍'} {hearts}
    </button>
  )
}