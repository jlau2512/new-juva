'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const NEON = '#FF3DCB';
const NEON_BRIGHT = '#FF99E5';
const NEON_CORE = '#FFD9F0';

// ---------------------------------------------------------------------------
// Procedural butterfly wing geometry — true butterfly silhouette via beziers.
// Wings extend in +X from origin (mirrored for the other side via scale.x=-1).
// ---------------------------------------------------------------------------
function makeForewingShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.45);
  s.bezierCurveTo(0.4, 1.55, 1.9, 1.7, 2.7, 0.95);
  s.bezierCurveTo(3.25, 0.35, 2.85, -0.25, 1.5, -0.15);
  s.lineTo(0, 0.45);
  return s;
}

function makeHindwingShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.2);
  s.bezierCurveTo(0.25, -1.1, 1.7, -1.45, 2.1, -0.8);
  s.bezierCurveTo(2.45, -0.2, 1.6, 0.25, 0.4, 0.0);
  s.lineTo(0, -0.2);
  return s;
}

function Butterfly({ pointerRef }: { pointerRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const rightWingsRef = useRef<THREE.Group>(null);
  const leftWingsRef = useRef<THREE.Group>(null);
  const rightHindRef = useRef<THREE.Group>(null);
  const leftHindRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  // Geometries (memoised so they're built once)
  const forewingGeom = useMemo(() => new THREE.ShapeGeometry(makeForewingShape(), 32), []);
  const hindwingGeom = useMemo(() => new THREE.ShapeGeometry(makeHindwingShape(), 32), []);

  // Three layered materials per wing for a neon-glow stack
  const wingMain = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: NEON,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );
  const wingGlow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: NEON_BRIGHT,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  const wingCore = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: NEON_CORE,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  const bodyMat = useMemo(() => new THREE.MeshBasicMaterial({ color: NEON }), []);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: NEON,
        transparent: true,
        opacity: 0.085,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  // Antennae — 3D tubes along curved beziers
  const leftAntennaGeom = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-0.04, 0.82, 0.03),
          new THREE.Vector3(-0.18, 1.05, 0.03),
          new THREE.Vector3(-0.3, 1.2, 0.0),
        ),
        12,
        0.018,
        6,
        false,
      ),
    [],
  );
  const rightAntennaGeom = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0.04, 0.82, 0.03),
          new THREE.Vector3(0.18, 1.05, 0.03),
          new THREE.Vector3(0.3, 1.2, 0.0),
        ),
        12,
        0.018,
        6,
        false,
      ),
    [],
  );

  const lastX = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Smooth cosine flap — forewings lead, hindwings lag slightly (real butterfly behaviour)
    const flap = (Math.cos(t * 8.5) + 1) / 2; // 0..1
    const flapLag = (Math.cos(t * 8.5 - 0.4) + 1) / 2;
    const wingAngle = flap * Math.PI * 0.6;       // 0..108°
    const hindAngle = flapLag * Math.PI * 0.5;    // 0..90°

    if (rightWingsRef.current) rightWingsRef.current.rotation.y = -wingAngle;
    if (leftWingsRef.current) leftWingsRef.current.rotation.y = wingAngle;
    if (rightHindRef.current) rightHindRef.current.rotation.y = -hindAngle;
    if (leftHindRef.current) leftHindRef.current.rotation.y = hindAngle;

    // Lazy elliptical orbit around the cursor — "wants to land"
    const orbitX = Math.cos(t * 0.95) * 14;
    const orbitY = Math.sin(t * 1.3) * 10;

    // Convert cursor px (top-left origin) to world units (center origin, Y-up)
    const tx = pointerRef.current.x + orbitX - size.width / 2;
    const ty = -(pointerRef.current.y + orbitY - size.height / 2);

    if (groupRef.current) {
      // Soft chase
      const lerp = 0.11;
      groupRef.current.position.x += (tx - groupRef.current.position.x) * lerp;
      groupRef.current.position.y += (ty - groupRef.current.position.y) * lerp;

      // Lean toward direction of travel — body banks like a real one
      const vx = groupRef.current.position.x - lastX.current;
      lastX.current = groupRef.current.position.x;
      const targetTilt = -vx * 0.025;
      groupRef.current.rotation.z += (targetTilt - groupRef.current.rotation.z) * 0.12;
    }
  });

  return (
    <group ref={groupRef} scale={13}>
      {/* Background neon halo — always visible behind everything */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[3.2, 32]} />
        <primitive object={haloMat} attach="material" />
      </mesh>

      {/* RIGHT wings group */}
      <group ref={rightWingsRef}>
        {/* Hindwing on its own sub-group so it can phase-lag */}
        <group ref={rightHindRef}>
          <mesh geometry={hindwingGeom} material={wingGlow} position={[0, -0.1, -0.05]} scale={1.22} />
          <mesh geometry={hindwingGeom} material={wingMain} position={[0, -0.1, -0.02]} />
          <mesh geometry={hindwingGeom} material={wingCore} position={[0, -0.1, -0.005]} scale={0.55} />
        </group>
        {/* Forewing */}
        <mesh geometry={forewingGeom} material={wingGlow} position={[0, 0.1, -0.05]} scale={1.2} />
        <mesh geometry={forewingGeom} material={wingMain} position={[0, 0.1, 0]} />
        <mesh geometry={forewingGeom} material={wingCore} position={[0, 0.1, 0.01]} scale={0.6} />
      </group>

      {/* LEFT wings group — mirrored via scale.x = -1 (materials are DoubleSide so winding is fine) */}
      <group ref={leftWingsRef} scale={[-1, 1, 1]}>
        <group ref={leftHindRef}>
          <mesh geometry={hindwingGeom} material={wingGlow} position={[0, -0.1, -0.05]} scale={1.22} />
          <mesh geometry={hindwingGeom} material={wingMain} position={[0, -0.1, -0.02]} />
          <mesh geometry={hindwingGeom} material={wingCore} position={[0, -0.1, -0.005]} scale={0.55} />
        </group>
        <mesh geometry={forewingGeom} material={wingGlow} position={[0, 0.1, -0.05]} scale={1.2} />
        <mesh geometry={forewingGeom} material={wingMain} position={[0, 0.1, 0]} />
        <mesh geometry={forewingGeom} material={wingCore} position={[0, 0.1, 0.01]} scale={0.6} />
      </group>

      {/* Body — slim capsule, sits slightly above the wings in Z */}
      <mesh material={bodyMat} position={[0, 0, 0.04]}>
        <capsuleGeometry args={[0.07, 1.35, 6, 10]} />
      </mesh>

      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.78, 0.06]}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>

      {/* Antennae as 3D tubes */}
      <mesh geometry={leftAntennaGeom} material={bodyMat} />
      <mesh geometry={rightAntennaGeom} material={bodyMat} />

      {/* Antennae club tips */}
      <mesh material={bodyMat} position={[-0.3, 1.2, 0.0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
      <mesh material={bodyMat} position={[0.3, 1.2, 0.0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
    </group>
  );
}

export default function ButterflyCursorInner() {
  const pointerRef = useRef({ x: -300, y: -300 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 50], zoom: 1, near: 0.1, far: 1000 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Butterfly pointerRef={pointerRef} />
      </Canvas>
    </div>
  );
}
