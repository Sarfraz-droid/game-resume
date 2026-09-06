import { useEffect, useState } from 'react'
import { RESUME } from '../data/resume.js'

export default function LoadingScreen() {
  const [p, setP] = useState(8)
  useEffect(() => {
    const id = setInterval(() => setP((v) => Math.min(100, v + Math.random() * 26)), 140)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-mark">◐</div>
        <p className="loading-name">{RESUME.profile.name}</p>
        <p className="loading-sub">building the island…</p>
        <div className="loading-bar">
          <div className="loading-fill" style={{ width: p + '%' }} />
        </div>
      </div>
    </div>
  )
}
