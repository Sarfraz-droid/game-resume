// Tiny optional audio: one synthesised engine hum + soft UI blips.
// No files, no autoplay — the AudioContext is only created after a user gesture
// (the Start button), and stays silent until the user turns sound on.

let ctx = null
let master = null
let engineGain = null
let engineOsc = null
let engineOsc2 = null
let enabled = false

export function initSound() {
  if (ctx) return
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    engineGain = ctx.createGain()
    engineGain.gain.value = 0.0
    engineGain.connect(master)

    engineOsc = ctx.createOscillator()
    engineOsc.type = 'sawtooth'
    engineOsc.frequency.value = 60
    engineOsc.connect(engineGain)
    engineOsc.start()

    engineOsc2 = ctx.createOscillator()
    engineOsc2.type = 'sine'
    engineOsc2.frequency.value = 90
    engineOsc2.connect(engineGain)
    engineOsc2.start()
  } catch {
    ctx = null
  }
}

export function setSoundEnabled(on) {
  enabled = on
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  master.gain.setTargetAtTime(on ? 0.6 : 0, ctx.currentTime, 0.08)
}

/** speed: 0..1 */
export function updateEngine(speed) {
  if (!ctx || !enabled) return
  const t = ctx.currentTime
  engineOsc.frequency.setTargetAtTime(55 + speed * 120, t, 0.1)
  engineOsc2.frequency.setTargetAtTime(85 + speed * 200, t, 0.1)
  engineGain.gain.setTargetAtTime(0.02 + speed * 0.13, t, 0.1)
}

export function blip(kind = 'open') {
  if (!ctx || !enabled) return
  try {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = kind === 'open' ? 520 : 380
    o.frequency.setTargetAtTime(kind === 'open' ? 760 : 240, ctx.currentTime, 0.06)
    g.gain.value = 0.0001
    g.gain.setTargetAtTime(0.18, ctx.currentTime, 0.005)
    g.gain.setTargetAtTime(0, ctx.currentTime + 0.06, 0.08)
    o.connect(g)
    g.connect(master)
    o.start()
    o.stop(ctx.currentTime + 0.3)
  } catch {
    /* ignore */
  }
}
