/**
 * Pure pointer-to-Normalized-Device-Coordinates conversion. No Three.js
 * dependency so it can be unit-tested.
 */
export function toNDC(clientX: number, clientY: number, width: number, height: number): { x: number; y: number } {
  return {
    x: (clientX / width) * 2 - 1,
    y: -(clientY / height) * 2 + 1,
  };
}
