import { zoneLayout } from './layout.js'
import ZoneMarker from './ZoneMarker.jsx'

export default function Zones() {
  return zoneLayout.map((z) => <ZoneMarker key={z.key} zone={z} />)
}
