import { useEffect, useState } from 'react'
export function usePortraitView() {
  const [portrait, setPortrait] = useState(() => window.matchMedia('(max-aspect-ratio: 17/20)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-aspect-ratio: 17/20)')
    const update = () => setPortrait(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return portrait
}
