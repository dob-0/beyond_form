#!/usr/bin/env node
// Split the merged houses mesh into one node per connected component (house),
// so the page can animate each house independently. Reads a plain (non-draco)
// GLB, writes a multi-node GLB; compress the output with gltf-transform after.
//
// Usage: node scripts/split-houses.mjs <in-plain.glb> <out.glb>
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

const [, , inPath, outPath] = process.argv
if (!inPath || !outPath) {
  console.error('usage: split-houses.mjs <in-plain.glb> <out.glb>')
  process.exit(1)
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const src = await io.read(inPath)
const prim = src.getRoot().listMeshes()[0].listPrimitives()[0]
const pos = prim.getAttribute('POSITION').getArray()
const uv = prim.getAttribute('TEXCOORD_0')?.getArray()
const normal = prim.getAttribute('NORMAL')?.getArray()
const indices = prim.getIndices().getArray()
const vertCount = pos.length / 3

// union-find, seeded by welding vertices that share a quantized position
const parent = new Int32Array(vertCount).map((_, i) => i)
const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a] } return a }
const union = (a, b) => { const ra = find(a); const rb = find(b); if (ra !== rb) parent[rb] = ra }

const byPos = new Map()
for (let v = 0; v < vertCount; v++) {
  const key = `${Math.round(pos[v * 3] * 1e4)},${Math.round(pos[v * 3 + 1] * 1e4)},${Math.round(pos[v * 3 + 2] * 1e4)}`
  const seen = byPos.get(key)
  if (seen === undefined) byPos.set(key, v)
  else union(seen, v)
}
for (let t = 0; t < indices.length; t += 3) {
  union(indices[t], indices[t + 1])
  union(indices[t], indices[t + 2])
}

const componentOf = new Map() // root -> component id
const compTris = new Map() // component id -> triangle index list
for (let t = 0; t < indices.length; t += 3) {
  const root = find(indices[t])
  let comp = componentOf.get(root)
  if (comp === undefined) { comp = componentOf.size; componentOf.set(root, comp) }
  let list = compTris.get(comp)
  if (!list) { list = []; compTris.set(comp, list) }
  list.push(t)
}
console.log(`${vertCount} verts, ${indices.length / 3} tris → ${compTris.size} components`)

const out = new Document()
const buffer = out.createBuffer()
const scene = out.createScene('houses')
const srcMaterial = prim.getMaterial()
const texture = srcMaterial?.getBaseColorTexture()
let outTexture = null
if (texture) {
  outTexture = out.createTexture('stamp').setImage(texture.getImage()).setMimeType(texture.getMimeType())
}
const material = out.createMaterial('stamp')
  .setRoughnessFactor(srcMaterial?.getRoughnessFactor() ?? 1)
  .setMetallicFactor(srcMaterial?.getMetallicFactor() ?? 0)
if (outTexture) material.setBaseColorTexture(outTexture)

// drop dust: components under 50 triangles are scan debris
const comps = [...compTris.entries()].filter(([, tris]) => tris.length >= 50)

for (const [comp, tris] of comps) {
  const remap = new Map()
  const outIdx = []
  for (const t of tris) {
    for (let k = 0; k < 3; k++) {
      const v = indices[t + k]
      let nv = remap.get(v)
      if (nv === undefined) { nv = remap.size; remap.set(v, nv) }
      outIdx.push(nv)
    }
  }
  const n = remap.size
  const outPos = new Float32Array(n * 3)
  const outUv = uv ? new Float32Array(n * 2) : null
  const outNorm = normal ? new Float32Array(n * 3) : null
  // center each house on its own origin; the node carries the offset
  let cx = 0, cy = 0, cz = 0
  for (const [v] of remap) { cx += pos[v * 3]; cy += pos[v * 3 + 1]; cz += pos[v * 3 + 2] }
  cx /= n; cy /= n; cz /= n
  for (const [v, nv] of remap) {
    outPos[nv * 3] = pos[v * 3] - cx
    outPos[nv * 3 + 1] = pos[v * 3 + 1] - cy
    outPos[nv * 3 + 2] = pos[v * 3 + 2] - cz
    if (outUv) { outUv[nv * 2] = uv[v * 2]; outUv[nv * 2 + 1] = uv[v * 2 + 1] }
    if (outNorm) { outNorm[nv * 3] = normal[v * 3]; outNorm[nv * 3 + 1] = normal[v * 3 + 1]; outNorm[nv * 3 + 2] = normal[v * 3 + 2] }
  }
  const p = out.createPrimitive()
    .setAttribute('POSITION', out.createAccessor().setType('VEC3').setArray(outPos).setBuffer(buffer))
    .setIndices(out.createAccessor().setType('SCALAR').setArray(
      n < 65536 ? new Uint16Array(outIdx) : new Uint32Array(outIdx)).setBuffer(buffer))
    .setMaterial(material)
  if (outUv) p.setAttribute('TEXCOORD_0', out.createAccessor().setType('VEC2').setArray(outUv).setBuffer(buffer))
  if (outNorm) p.setAttribute('NORMAL', out.createAccessor().setType('VEC3').setArray(outNorm).setBuffer(buffer))
  const node = out.createNode(`house_${comp}`)
    .setMesh(out.createMesh(`house_${comp}`).addPrimitive(p))
    .setTranslation([cx, cy, cz])
  scene.addChild(node)
}

await io.write(outPath, out)
console.log(`wrote ${outPath} with ${comps.length} houses`)
