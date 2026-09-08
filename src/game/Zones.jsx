import WorldResumeCard from './WorldResumeCard.jsx'
import ZoneMarker from './ZoneMarker.jsx'
import { exhibitStops } from './exhibitStops.js'

export default function Zones() {
  return <>
    <WorldResumeCard />
    {exhibitStops.map(stop => <ZoneMarker key={stop.id} stop={stop} />)}
  </>
}
