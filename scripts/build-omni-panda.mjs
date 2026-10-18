import { Blob } from 'node:buffer';
import { writeFileSync, mkdirSync } from 'node:fs';

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onloadend = null;
    }
    readAsArrayBuffer(blob) {
      Blob.prototype.arrayBuffer.call(blob).then((buffer) => {
        this.result = buffer;
        this.onloadend?.();
      });
    }
    readAsDataURL(blob) {
      Blob.prototype.arrayBuffer.call(blob).then((buffer) => {
        this.result = `data:application/octet-stream;base64,${Buffer.from(buffer).toString('base64')}`;
        this.onloadend?.();
      });
    }
  };
}
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const fur = new THREE.MeshStandardMaterial({ color: 0xf7f7f5, roughness: 0.78, metalness: 0 });
const black = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.72, metalness: 0 });
const noseMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.45, metalness: 0.05 });
const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.35, metalness: 0 });
const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.3, metalness: 0 });

function mesh(name, geometry, material, position, scale) {
  const item = new THREE.Mesh(geometry, material);
  item.name = name;
  item.position.set(position[0], position[1], position[2]);
  if (scale) item.scale.set(scale[0], scale[1], scale[2]);
  return item;
}

const sphere = (radius) => new THREE.SphereGeometry(radius, 48, 36);
const panda = new THREE.Group();
panda.name = 'Panda';

const head = new THREE.Group();
head.name = 'Head';
head.add(mesh('Skull', sphere(0.62), fur, [0, 0.22, 0], [1.05, 0.98, 0.96]));
head.add(mesh('EarL', sphere(0.24), black, [-0.46, 0.72, -0.02]));
head.add(mesh('EarR', sphere(0.24), black, [0.46, 0.72, -0.02]));
head.add(mesh('EarInnerL', sphere(0.12), fur, [-0.46, 0.72, 0.06]));
head.add(mesh('EarInnerR', sphere(0.12), fur, [0.46, 0.72, 0.06]));
head.add(mesh('PatchL', sphere(0.2), black, [-0.24, 0.22, 0.36], [1.25, 1.05, 0.55]));
head.add(mesh('PatchR', sphere(0.2), black, [0.24, 0.22, 0.36], [1.25, 1.05, 0.55]));
head.add(mesh('EyeL', sphere(0.09), eyeWhite, [-0.22, 0.22, 0.5]));
head.add(mesh('EyeR', sphere(0.09), eyeWhite, [0.22, 0.22, 0.5]));
head.add(mesh('PupilL', sphere(0.045), pupilMat, [-0.22, 0.21, 0.57]));
head.add(mesh('PupilR', sphere(0.045), pupilMat, [0.22, 0.21, 0.57]));
head.add(mesh('Muzzle', sphere(0.2), fur, [0, 0.02, 0.42], [1.15, 0.75, 0.7]));
head.add(mesh('Nose', sphere(0.07), noseMat, [0, 0.06, 0.58], [1.1, 0.75, 0.8]));
panda.add(head);

panda.add(mesh('Body', sphere(0.5), fur, [0, -0.58, 0], [1.05, 0.92, 0.9]));
panda.add(mesh('ArmL', sphere(0.16), black, [-0.48, -0.48, 0.08], [0.7, 1.35, 0.7]));
panda.add(mesh('ArmR', sphere(0.16), black, [0.48, -0.48, 0.08], [0.7, 1.35, 0.7]));
panda.add(mesh('FootL', sphere(0.16), black, [-0.22, -1.02, 0.08], [1.05, 0.7, 1.2]));
panda.add(mesh('FootR', sphere(0.16), black, [0.22, -1.02, 0.08], [1.05, 0.7, 1.2]));

const exporter = new GLTFExporter();
const binary = await exporter.parseAsync(panda, { binary: true });
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models', 'omni-panda.glb');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(binary));
console.log('wrote', out, Buffer.from(binary).length);
