'use client';

import React, { useEffect, useRef } from 'react';
import type * as THREE_NS from 'three';
import { cn } from '@/lib/utils';

export type OmniAgentState = 'IDLE' | 'THINKING' | 'WORKING' | 'READING' | 'EDITING';

export interface OmniEntity3DProps {
  state?: OmniAgentState;
  size?: number;
  className?: string;
  statusText?: string;
  showLabel?: boolean;
}

export function OmniEntity3D({
  state = 'IDLE',
  size = 52,
  className,
  statusText,
  showLabel = false,
}: OmniEntity3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let frame = 0;
    let renderer: THREE_NS.WebGLRenderer | null = null;

    const start = async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      if (disposed || !canvasRef.current) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const rendererInstance = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer = rendererInstance;
      rendererInstance.setPixelRatio(pixelRatio);
      rendererInstance.setSize(size, size, false);
      rendererInstance.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
      camera.position.set(0, 0.05, 3.4);
      camera.lookAt(0, 0.02, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.72));
      const key = new THREE.DirectionalLight(0xffffff, 1.7);
      key.position.set(-1.6, 2.4, 3.2);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xd7dde8, 0.45);
      fill.position.set(2.2, 0.4, 1.4);
      scene.add(fill);

      const gltf = await new GLTFLoader().loadAsync('/models/omni-panda.glb');
      if (disposed) return;

      const panda = gltf.scene;
      const box = new THREE.Box3().setFromObject(panda);
      const center = box.getCenter(new THREE.Vector3());
      const height = Math.max(box.getSize(new THREE.Vector3()).y, 0.001);
      panda.position.sub(center);
      panda.scale.setScalar(1.85 / height);

      const head = panda.getObjectByName('Head');
      const pupilL = panda.getObjectByName('PupilL');
      const pupilR = panda.getObjectByName('PupilR');
      scene.add(panda);

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const clock = new THREE.Clock();

      const render = () => {
        if (disposed) return;
        const t = reduceMotion ? 0 : clock.getElapsedTime();
        let yaw = Math.sin(t * 0.7) * 0.28;
        let pitch = Math.sin(t * 0.5) * 0.04;
        let bob = Math.sin(t * 1.4) * 0.03;

        if (state === 'THINKING') {
          yaw = Math.sin(t * 0.8) * 0.12;
          pitch = 0.16;
          bob = Math.sin(t * 2) * 0.015;
        } else if (state === 'WORKING') {
          yaw = Math.sin(t * 1.5) * 0.34;
          pitch = Math.sin(t * 2) * 0.05;
        } else if (state === 'READING') {
          yaw = 0.08;
          pitch = 0.22;
        } else if (state === 'EDITING') {
          yaw = Math.sin(t * 1.2) * 0.16;
          pitch = Math.sin(t * 2.2) * 0.08;
        }

        panda.rotation.y = yaw;
        panda.position.y = bob;
        if (head) head.rotation.x = pitch;
        const blink = !reduceMotion && (t % 4.4) > 4.22 ? 0.12 : 1;
        if (pupilL) pupilL.scale.y = blink;
        if (pupilR) pupilR.scale.y = blink;

        rendererInstance.render(scene, camera);
        if (!reduceMotion) frame = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(frame);
        panda.traverse((obj) => {
          const mesh = obj as THREE_NS.Mesh;
          mesh.geometry?.dispose?.();
          const material = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material?.dispose?.();
        });
        rendererInstance.dispose();
      };
    };

    let stop = () => {};
    start().then((disposeScene) => {
      if (disposed) disposeScene?.();
      else if (disposeScene) stop = disposeScene;
    }).catch((error) => {
      console.error('[Omni panda]', error);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      stop();
      renderer?.dispose();
    };
  }, [size, state]);

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Omni panda"
          style={{ width: `${size}px`, height: `${size}px` }}
          className="block"
        />
      </div>

      {showLabel && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold text-[#F5F5F5] tracking-tight leading-snug">
            Omni
          </span>
          {statusText && (
            <span className="text-xs text-[#737373] font-normal leading-normal transition-opacity duration-200">
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
