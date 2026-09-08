import { useStore } from '../state/store.js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { atmosphereAt } from './timeOfDay.js'

const Context = createContext(null)
export const useAtmosphere = () => useContext(Context)

export function useLocalAtmosphere() {
  const mode = useStore(s => s.timeOfDay)
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000))
  useEffect(() => {
    const update = () => setMinute(Math.floor(Date.now() / 60000))
    const timer = setInterval(update, 10000)
    const onVisible = () => { if (!document.hidden) update() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  return useMemo(() => atmosphereAt(new Date(minute * 60000), mode), [minute, mode])
}

export default function Atmosphere({ children }) {
  const atmosphere = useLocalAtmosphere()
  return <Context.Provider value={atmosphere}>
    <color attach="background" args={[atmosphere.fog]} />
    <fogExp2 attach="fog" args={[atmosphere.fog, atmosphere.fogDensity]} />
    {children}
  </Context.Provider>
}
