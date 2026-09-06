import Lighting from './Lighting.jsx'
import Sky from './env/Sky.jsx'
import Island from './env/Island.jsx'
import Grass from './env/Grass.jsx'
import Flora from './env/Flora.jsx'
import Scenery from './env/Scenery.jsx'
import Zones from './Zones.jsx'
import Car from './Car.jsx'
import Effects from './Effects.jsx'
import DriftPuffs from './DriftPuffs.jsx'

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#c8dcd8', 96, 310]} />
      <Lighting />
      <Sky />
      <Island />
      <Grass />
      <Flora />
      <Scenery />
      <Zones />
      <Car />
      <DriftPuffs />
      <Effects />
    </>
  )
}
