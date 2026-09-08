import ZoneMarker, { PopupCards } from './ZoneMarker.jsx'
import { useStore } from '../state/store.js'
import { exhibitStops, tourMarkers } from './exhibitStops.js'

export default function Zones() {
  const currentStop = useStore(s => s.currentStop)
  const profiles = exhibitStops.filter(stop => stop.zone.key === 'profile')
  const selected = exhibitStops.find(stop => stop.id === currentStop)
  return <>
    {tourMarkers.map(zone => <ZoneMarker key={zone.key} zone={zone} />)}
    {exhibitStops.map(stop => <group key={stop.id} position={stop.pos}>
      {stop.pageIndex > 0 && <mesh position={[0, .1, 0]}><cylinderGeometry args={[.35, .45, .2, 16]} /><meshStandardMaterial color={stop.zone.color} emissive={stop.zone.color} emissiveIntensity={.3} /></mesh>}
    </group>)}
    {profiles.map(stop => <group key={stop.id} position={stop.pos}><PopupCards stop={stop} permanent /></group>)}
    {selected && selected.zone.key !== 'profile' && <group key={selected.id} position={selected.pos}><PopupCards stop={selected} /></group>}
  </>
}
