import { Color } from 'three'

const smooth = value => { const x = Math.max(0, Math.min(1, value)); return x * x * (3 - 2 * x) }
const mix = (day, night, amount) => '#' + new Color(day).lerp(new Color(night), amount).getHexString()

// Visitor-local time. Dawn runs 06:00–08:00; dusk runs 17:00–19:00.
export function atmosphereAt(date = new Date(), mode = 'auto') {
  const hour = date.getHours() + date.getMinutes() / 60
  const daylight = mode === 'day' ? 1 : mode === 'night' ? 0 : smooth((hour - 6) / 2) * (1 - smooth((hour - 17) / 2))
  const night = 1 - daylight
  return {
    night,
    fog: mix('#d3c6b5', '#142338', night),
    fogDensity: .008 + night * .004,
    sky: ['#bba7a0', '#e5c5a7', '#f4d9b2', '#efbd88'].map((color, i) => mix(color, ['#070e1c', '#101e33', '#1e3047', '#26384a'][i], night)),
    key: mix('#ffd29b', '#b8d1ff', night),
    fill: mix('#e3c7ad', '#7099ca', night),
    ground: mix('#70503c', '#17283b', night),
    keyIntensity: 1.55 - night * 1.03,
    hemisphere: .64 - night * .29,
    ambient: .12 - night * .05,
    reflection: 1 - night * .7,
    cloud: mix('#ffffff', '#506079', night),
    water: mix('#708b86', '#182c3d', night),
  }
}
