'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ACCENT = '#C8FF3D';

/* ---------------------------------------------------------------------------
 * Procedural plant generation — deterministic (seeded RNG), runs once.
 * A trunk grows up, splits into 3 levels of branches, leaf clusters at tips.
 * Each segment carries a growStart/growDuration so the plant reveals
 * progressively (trunk first, then branches cascade out, then leaves bloom).
 * ------------------------------------------------------------------------- */
type Segment = {
  curve: THREE.CatmullRomCurve3;
  radius: number;
  level: number;
  growStart: number;
  growDuration: number;
};
type Leaf = {
  position: THREE.Vector3;
  scale: number;
  rotation: [number, number, number];
  growStart: number;
};

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
    growStart: number,
  ) {
    const growDuration = 0.7 - level * 0.06;
    const end = start.clone().addScaledVector(dir, length);
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
      growStart,
      growDuration,
    });
    const growEnd = growStart + growDuration;

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
          growStart: growEnd + rng() * 0.35,
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
      // children start growing just before the parent finishes → cascade
      grow(
        end,
        newDir,
        length * (0.62 + rng() * 0.18),
        radius * 0.62,
        level + 1,
        maxLevel,
        growEnd - 0.18 + rng() * 0.12,
      );
    }
  }

  grow(new THREE.Vector3(0, -1.7, 0), new THREE.Vector3(0, 1, 0), 1.7, 0.085, 0, 3, 0);
  return { segments, leaves };
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* ---------------------------------------------------------------------------
 * The plant mesh group. Growth = progressive geometry draw-range reveal
 * (the tube literally draws itself from base to tip), NOT a uniform pop-scale.
 * ------------------------------------------------------------------------- */
function Plant({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { segments, leaves } = useMemo(generatePlant, []);

  const tubeGeometries = useMemo(
    () =>
      segments.map((s) => {
        const g = new THREE.TubeGeometry(
          s.curve,
          Math.max(8, 16 - s.level * 2),
          s.radius,
          5,
          false,
        );
        g.setDrawRange(0, 0); // hidden until the growth animation reveals it
        return g;
      }),
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

  const leafRefs = useRef<(THREE.Mesh | null)[]>([]);
  const mountTime = useRef<number | null>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mountTime.current === null) mountTime.current = t;
    const elapsed = t - mountTime.current;

    // grow branches: each tube draws itself base → tip via draw range
    for (let i = 0; i < tubeGeometries.length; i++) {
      const seg = segments[i];
      const geo = tubeGeometries[i];
      const p = Math.min(1, Math.max(0, (elapsed - seg.growStart) / seg.growDuration));
      const eased = easeOutCubic(p);
      const idxCount = geo.index ? geo.index.count : 0;
      geo.setDrawRange(0, Math.ceil(idxCount * eased));
    }

    // bloom leaves: scale in with a slight overshoot, staggered after branches
    for (let i = 0; i < leaves.length; i++) {
      const mesh = leafRefs.current[i];
      if (!mesh) continue;
      const leaf = leaves[i];
      const p = Math.min(1, Math.max(0, (elapsed - leaf.growStart) / 0.45));
      mesh.scale.setScalar(leaf.scale * (p <= 0 ? 0 : easeOutBack(p)));
    }

    // idle sway + mouse-reactive rotation (lerped — no jitter)
    const g = groupRef.current;
    if (g) {
      const sway = Math.sin(t * 0.5) * 0.035;
      const targetY = pointer.current.x * 0.4 + sway;
      const targetX = pointer.current.y * -0.16;
      g.rotation.y += (targetY - g.rotation.y) * 0.05;
      g.rotation.x += (targetX - g.rotation.x) * 0.05;
    }
  });

  useEffect(
    () => () => {
      tubeGeometries.forEach((g) => g.dispose());
      leafGeometry.dispose();
      branchMaterial.dispose();
      leafMaterial.dispose();
    },
    [tubeGeometries, leafGeometry, branchMaterial, leafMaterial],
  );

  return (
    <group ref={groupRef} scale={0.7} position={[0, -0.1, 0]}>
      {tubeGeometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={branchMaterial} />
      ))}
      {leaves.map((leaf, i) => (
        <mesh
          key={`leaf-${i}`}
          ref={(el) => {
            leafRefs.current[i] = el;
          }}
          geometry={leafGeometry}
          material={leafMaterial}
          position={leaf.position}
          rotation={leaf.rotation}
          scale={0}
        />
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * Public component — the WebGL canvas. Lazy-loaded by Hero.tsx (ssr:false),
 * so Three.js never touches the initial bundle / first paint.
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
      camera={{ position: [0, 0.6, 6.5], fov: 36 }}
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
