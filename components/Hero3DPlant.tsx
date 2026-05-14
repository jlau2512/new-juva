'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ACCENT = '#C8FF3D';

/* ---------------------------------------------------------------------------
 * Procedural plant generation — deterministic (seeded RNG), runs once.
 * A trunk grows up, splits into 3 levels of branches, leaf clusters at tips.
 * ------------------------------------------------------------------------- */
type Segment = { curve: THREE.CatmullRomCurve3; radius: number; level: number };
type Leaf = { position: THREE.Vector3; scale: number; rotation: [number, number, number] };

function generatePlant() {
  let seed = 8675309;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const segments: Segment[] = [];
  const leaves: Leaf[] = [];

  function grow(
    start: THREE.Vector3,
    dir: THREE.Vector3,
    length: number,
    radius: number,
    level: number,
    maxLevel: number,
  ) {
    const end = start.clone().addScaledVector(dir, length);
    // gentle organic curve via an offset control point
    const ctrl = start
      .clone()
      .addScaledVector(dir, length * 0.5)
      .add(
        new THREE.Vector3(
          (rng() - 0.5) * length * 0.4,
          length * 0.08,
          (rng() - 0.5) * length * 0.4,
        ),
      );
    segments.push({
      curve: new THREE.CatmullRomCurve3([start, ctrl, end]),
      radius,
      level,
    });

    if (level >= maxLevel) {
      const count = 3 + Math.floor(rng() * 4);
      for (let i = 0; i < count; i++) {
        leaves.push({
          position: end
            .clone()
            .add(
              new THREE.Vector3(
                (rng() - 0.5) * 0.5,
                (rng() - 0.5) * 0.5 + 0.1,
                (rng() - 0.5) * 0.5,
              ),
            ),
          scale: 0.07 + rng() * 0.07,
          rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
        });
      }
      return;
    }

    const children = level === 0 ? 3 : 2 + Math.floor(rng() * 2);
    for (let c = 0; c < children; c++) {
      const tilt = 0.32 + rng() * 0.5;
      const azimuth = (c / children) * Math.PI * 2 + rng() * 0.9;
      const up =
        Math.abs(dir.y) > 0.95
          ? new THREE.Vector3(1, 0, 0)
          : new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(dir, up).normalize();
      const newDir = dir
        .clone()
        .applyAxisAngle(side, tilt)
        .applyAxisAngle(dir, azimuth)
        .normalize();
      grow(end, newDir, length * (0.62 + rng() * 0.18), radius * 0.62, level + 1, maxLevel);
    }
  }

  grow(new THREE.Vector3(0, -1.7, 0), new THREE.Vector3(0, 1, 0), 1.7, 0.085, 0, 3);
  return { segments, leaves };
}

/* ---------------------------------------------------------------------------
 * The plant mesh group — mouse-reactive rotation + idle sway + growth-in.
 * ------------------------------------------------------------------------- */
function Plant({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { segments, leaves } = useMemo(generatePlant, []);

  const tubeGeometries = useMemo(
    () =>
      segments.map((s) =>
        new THREE.TubeGeometry(s.curve, Math.max(6, 14 - s.level * 2), s.radius, 5, false),
      ),
    [segments],
  );
  const leafGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const branchMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: ACCENT,
        roughness: 0.55,
        metalness: 0.05,
        emissive: new THREE.Color(ACCENT),
        emissiveIntensity: 0.06,
      }),
    [],
  );
  const leafMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: ACCENT,
        roughness: 0.4,
        metalness: 0,
        emissive: new THREE.Color(ACCENT),
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.92,
      }),
    [],
  );

  const mountTime = useRef<number | null>(null);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.getElapsedTime();
    if (mountTime.current === null) mountTime.current = t;
    const elapsed = t - mountTime.current;

    // growth-in: ease-out cubic scale 0 → 1 over ~2.2s
    const growth = Math.min(1, elapsed / 2.2);
    g.scale.setScalar(1 - Math.pow(1 - growth, 3));

    // idle sway + mouse-reactive rotation (lerped, no jitter)
    const sway = Math.sin(t * 0.5) * 0.04;
    const targetY = pointer.current.x * 0.5 + sway;
    const targetX = pointer.current.y * -0.2;
    g.rotation.y += (targetY - g.rotation.y) * 0.05;
    g.rotation.x += (targetX - g.rotation.x) * 0.05;
  });

  useEffect(
    () => () => {
      tubeGeometries.forEach((geo) => geo.dispose());
      leafGeometry.dispose();
      branchMaterial.dispose();
      leafMaterial.dispose();
    },
    [tubeGeometries, leafGeometry, branchMaterial, leafMaterial],
  );

  return (
    <group ref={groupRef} scale={0}>
      {tubeGeometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={branchMaterial} />
      ))}
      {leaves.map((leaf, i) => (
        <mesh
          key={`leaf-${i}`}
          geometry={leafGeometry}
          material={leafMaterial}
          position={leaf.position}
          rotation={leaf.rotation}
          scale={leaf.scale}
        />
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * Public component — the WebGL canvas. Lazy-loaded by Hero.tsx (ssr:false),
 * so it never touches the initial bundle / first paint.
 * ------------------------------------------------------------------------- */
export default function Hero3DPlant() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.4, 5], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color={ACCENT} />
      <Plant pointer={pointer} />
    </Canvas>
  );
}
