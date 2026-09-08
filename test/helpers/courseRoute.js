import { CAR_SPAWN } from '../../src/game/layout.js'

// Centreline waypoints for the authored GLB, including its bridge and jump.
const points=[]
function line(x,z,v=7){points.push({x,z,v})}
function arc(cx,cz,r,start,end,v=5){for(let i=1;i<=10;i++){const a=start+(end-start)*i/10;line(cx+Math.cos(a)*r,cz+Math.sin(a)*r,v)}}
line(.15,-28);line(.15,-30.6,5);arc(4.7,-30.6,4.55,Math.PI,2*Math.PI)
line(9.25,-25,5);arc(13.8,-25,4.55,Math.PI,Math.PI/2)
line(19.7,-20.45,5);arc(19.7,-15.6,4.85,-Math.PI/2,0)
line(25,-10);line(25,-6);line(23.6,-2);line(24.5,3);line(24.25,6.95,5);arc(19.7,6.95,4.55,0,Math.PI/2)
line(15,11.5,13.5);line(8,11.5,13.5);line(-18,11.5,13.5);line(-23.2,11.5,5)
arc(-23.2,6.95,4.55,Math.PI/2,Math.PI*1.5)
line(-13.5,2.4,5);arc(-13.5,6.95,4.55,-Math.PI/2,0)
line(-8.95,25.6,5);arc(-4.4,25.6,4.55,Math.PI,0)
line(.15,18,5)
const dense=[{x:CAR_SPAWN.x,z:CAR_SPAWN.z,v:7}]
for(const point of points){const prev=dense.at(-1),n=Math.ceil(Math.hypot(point.x-prev.x,point.z-prev.z)/.4);for(let i=1;i<=n;i++)dense.push({x:prev.x+(point.x-prev.x)*i/n,z:prev.z+(point.z-prev.z)*i/n,v:point.v})}

export const courseRoute = dense
