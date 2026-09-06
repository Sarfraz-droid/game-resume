import * as THREE from 'three'

const tune = (t) => {
  if ('SRGBColorSpace' in THREE) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function emojiTexture(txt, px = 220) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')
  x.font = `${px}px serif`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(txt, 128, 146)
  return tune(new THREE.CanvasTexture(c))
}

export function labelTexture(title, sub) {
  const w = 512
  const h = 160
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  x.fillStyle = 'rgba(24,26,32,0.82)'
  roundRect(x, 6, 6, w - 12, h - 12, 26)
  x.fill()
  x.fillStyle = '#fff'
  x.textAlign = 'center'
  x.font = 'bold 46px system-ui, sans-serif'
  x.fillText(title, w / 2, 62)
  if (sub) {
    x.fillStyle = 'rgba(255,255,255,0.7)'
    x.font = '28px system-ui, sans-serif'
    x.fillText(sub, w / 2, 108)
  }
  return tune(new THREE.CanvasTexture(c))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
