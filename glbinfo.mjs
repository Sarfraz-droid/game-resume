import fs from 'fs';
const f = process.argv[2];
const buf = fs.readFileSync(f);
if (buf.readUInt32LE(0) !== 0x46546c67) { console.log('not glb'); process.exit(1); }
const total = buf.readUInt32LE(8);
let off = 12;
const chunkLen = buf.readUInt32LE(off);
const chunkType = buf.readUInt32LE(off+4);
off += 8;
const json = JSON.parse(buf.slice(off, off+chunkLen).toString('utf8'));
const meshes = (json.meshes||[]).map(m=>m.name);
const nodes = (json.nodes||[]).map(n=>n.name);
let prims = 0, hasIndices=0;
(json.meshes||[]).forEach(m=>m.primitives.forEach(p=>{prims++;}));
console.log('FILE', f, (fs.statSync(f).size/1e6).toFixed(2)+'MB');
console.log('meshes('+meshes.length+'):', meshes.slice(0,60).join(' | '));
console.log('nodes('+nodes.length+'):', nodes.slice(0,80).join(' | '));
console.log('materials:', (json.materials||[]).map(m=>m.name).join(', '));
console.log('primitives:', prims, ' accessors:', (json.accessors||[]).length, ' images:', (json.images||[]).length, ' textures:', (json.textures||[]).length);
// estimate vertex count
let verts=0;
(json.meshes||[]).forEach(m=>m.primitives.forEach(p=>{
  const a = json.accessors[p.attributes.POSITION];
  if(a) verts += a.count;
}));
console.log('total vertices:', verts);
