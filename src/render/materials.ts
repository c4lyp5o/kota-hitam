// Shared renderer state and the toon materials everything is drawn with.
import * as THREE from 'three';

// Filled in by the renderer in src/main.js. Loosely typed until that code moves here too.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const G: { overlays: (() => void)[]; [key: string]: any } = { overlays: [] };

const matCache: Record<string, THREE.Material> = {};
export function toon(color: number) {
  return (
    matCache[color] ||
    (matCache[color] = new THREE.MeshToonMaterial({ color, gradientMap: G.grad }))
  );
}
export function basic(color: number) {
  const k = 'b' + color;
  return matCache[k] || (matCache[k] = new THREE.MeshBasicMaterial({ color }));
}
export function ink<T extends THREE.Mesh>(mesh: T, t?: number | null) {
  t = t == null ? 0.06 : t;
  const geo = mesh.geometry;
  geo.computeBoundingBox();
  const s = new THREE.Vector3();
  geo.boundingBox!.getSize(s);
  const o = new THREE.Mesh(geo, G.inkMat);
  o.userData.ink = true;
  o.scale.set(
    1 + (2 * t) / Math.max(s.x, 0.05),
    1 + (2 * t) / Math.max(s.y, 0.05),
    1 + (2 * t) / Math.max(s.z, 0.05),
  );
  mesh.add(o);
  return mesh;
}
