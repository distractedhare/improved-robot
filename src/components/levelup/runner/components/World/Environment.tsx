/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';

const StarField: React.FC = () => {
  const speed = useStore(state => state.speed);
  const status = useStore(state => state.status);
  const count = 3000;
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50; // Keep mostly above horizon
      
      // Distribute Z randomly along the entire travel path plus buffer
      // Range: -550 to 100 to ensure full coverage from start
      let z = -550 + Math.random() * 650;

      // Exclude stars from the central play area
      if (Math.abs(x) < 15 && y > -5 && y < 20) {
          if (x < 0) x -= 15;
          else x += 15;
      }

      pos[i * 3] = x;     
      pos[i * 3 + 1] = y; 
      pos[i * 3 + 2] = z; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Total freeze during pause or trivia
    if (status !== 'PLAYING' && status !== 'SHOP') return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2; 

    for (let i = 0; i < count; i++) {
        let z = positions[i * 3 + 2];
        z += activeSpeed * delta * 2.0; // Parallax effect
        
        // Reset when it passes the camera (z > 100 gives plenty of buffer behind camera)
        if (z > 100) {
            // Reset far back with a random buffer to prevent "walls" of stars
            z = -550 - Math.random() * 50; 
            
            // Re-randomize X/Y on respawn with exclusion logic
            let x = (Math.random() - 0.5) * 400;
            let y = (Math.random() - 0.5) * 200 + 50;
            
            if (Math.abs(x) < 15 && y > -5 && y < 20) {
                if (x < 0) x -= 15;
                else x += 15;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
        }
        positions[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const LaneGuides: React.FC = () => {
    const { laneCount } = useStore();
    
    const separators = useMemo(() => {
        const lines: number[] = [];
        const startX = -(laneCount * LANE_WIDTH) / 2;
        
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    return (
        <group position={[0, 0.02, 0]}>
            {/* Lane Floor - Lowered slightly to -0.02 */}
            <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[laneCount * LANE_WIDTH, 200]} />
                <meshBasicMaterial color="#1a0b2e" transparent opacity={0.9} />
            </mesh>

            {/* Lane Separators - Glowing Lines */}
            {separators.map((x, i) => (
                <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.05, 200]} /> 
                    <meshBasicMaterial 
                        color="#E20074" 
                        transparent 
                        opacity={0.6} 
                    />
                </mesh>
            ))}
        </group>
    );
};

const RetroSun: React.FC = () => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const sunGroupRef = useRef<THREE.Group>(null);

    const { status } = useStore();

    useFrame((state) => {
        if (status !== 'PLAYING' && status !== 'SHOP') return;
        
        if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
        // Gentle bobbing
        if (sunGroupRef.current) {
            sunGroupRef.current.position.y = 30 + Math.sin(state.clock.elapsedTime * 0.2) * 1.0;
            sunGroupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color('#FFFFFF') }, 
        uColorBottom: { value: new THREE.Color('#E20074') } 
    }), []);

    return (
        <group ref={sunGroupRef} position={[0, 30, -180]}>
            {/* Reduced Geometry for Mobile: 32 segments instead of 64 */}
            <mesh>
                <sphereGeometry args={[35, 32, 32]} />
                <shaderMaterial
                    ref={matRef}
                    uniforms={uniforms}
                    transparent
                    vertexShader={`
                        varying vec2 vUv;

                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform float uTime;
                        uniform vec3 uColorTop;
                        uniform vec3 uColorBottom;

                        void main() {
                            // 1. Basic Vertical Gradient
                            vec3 color = mix(uColorBottom, uColorTop, vUv.y);
                            
                            // 2. Synthwave Scanlines
                            float stripeFreq = 40.0;
                            float stripeSpeed = 1.0;
                            // Simple scanline logic without heavy rim lighting
                            float stripes = sin((vUv.y * stripeFreq) - (uTime * stripeSpeed));
                            
                            // Create sharp bands
                            float stripeMask = smoothstep(0.2, 0.3, stripes);
                            
                            // Fade scanlines out towards the top of the sun
                            float scanlineFade = smoothstep(0.7, 0.3, vUv.y); 
                            
                            // Apply dark bands (scanlines)
                            vec3 finalColor = mix(color, color * 0.1, (1.0 - stripeMask) * scanlineFade);

                            gl_FragColor = vec4(finalColor, 1.0);
                        }
                    `}
                />
            </mesh>
        </group>
    );
};

const MovingGrid: React.FC = () => {
    const speed = useStore(state => state.speed);
    const status = useStore(state => state.status);
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
             if (status !== 'PLAYING' && status !== 'SHOP') return;

             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;
             
             // Grid cell size = 400 (length) / 40 (segments) = 10 units
             const cellSize = 10;
             
             // Move mesh forward (+Z) to simulate travel, then snap back
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
            <planeGeometry args={[300, 400, 30, 40]} />
            <meshBasicMaterial 
                color="#E20074" 
                wireframe 
                transparent 
                opacity={0.2} 
            />
        </mesh>
    );
};

const SynthwaveCity: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const wireframeRef = useRef<THREE.InstancedMesh>(null);
    const speed = useStore(state => state.speed);
    const status = useStore(state => state.status);
    const count = 80;

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const wireframeDummy = useMemo(() => new THREE.Object3D(), []);
    
    const buildingData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            const isLeft = i % 2 === 0;
            const xOffset = isLeft ? -15 - Math.random() * 40 : 15 + Math.random() * 40;
            const height = 10 + Math.random() * 60;
            const width = 4 + Math.random() * 8;
            const depth = 4 + Math.random() * 8;
            const z = -250 + Math.random() * 350;

            data.push({ x: xOffset, y: height / 2, z, width, height, depth });
        }
        return data;
    }, [count]);

    useEffect(() => {
        if (!meshRef.current || !wireframeRef.current) return;
        buildingData.forEach((b, i) => {
            dummy.position.set(b.x, b.y - 2, b.z);
            dummy.scale.set(b.width, b.height, b.depth);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            wireframeDummy.position.set(b.x, b.y - 2, b.z);
            wireframeDummy.scale.set(b.width * 1.01, b.height * 1.01, b.depth * 1.01);
            wireframeDummy.updateMatrix();
            wireframeRef.current!.setMatrixAt(i, wireframeDummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        wireframeRef.current.instanceMatrix.needsUpdate = true;
    }, [buildingData, dummy, wireframeDummy]);

    useFrame((state, delta) => {
        if (!meshRef.current || !wireframeRef.current || (status !== 'PLAYING' && status !== 'SHOP')) return;
        const activeSpeed = speed > 0 ? speed : 5;
        let needsUpdate = false;

        buildingData.forEach((b, i) => {
            b.z += activeSpeed * delta;
            if (b.z > 50) {
                b.z = -250 - Math.random() * 50;
                b.height = 10 + Math.random() * 60;
                b.y = b.height / 2;
            }
            dummy.position.set(b.x, b.y - 2, b.z);
            dummy.scale.set(b.width, b.height, b.depth);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            wireframeDummy.position.set(b.x, b.y - 2, b.z);
            wireframeDummy.scale.set(b.width * 1.05, b.height * 1.05, b.depth * 1.05);
            wireframeDummy.updateMatrix();
            wireframeRef.current!.setMatrixAt(i, wireframeDummy.matrix);
            
            needsUpdate = true;
        });

        if (needsUpdate) {
            meshRef.current.instanceMatrix.needsUpdate = true;
            wireframeRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#0b0512" roughness={0.8} metalness={0.2} />
            </instancedMesh>
            <instancedMesh ref={wireframeRef} args={[undefined, undefined, count]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.15} />
            </instancedMesh>
        </group>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 40, 160]} />
      
      <ambientLight intensity={0.4} color="#E20074" />
      <directionalLight position={[0, 20, -10]} intensity={1.5} color="#E20074" />
      <pointLight position={[0, 25, -150]} intensity={4} color="#E20074" distance={300} decay={2} />
      
      <StarField />
      <SynthwaveCity />
      <MovingGrid />
      <LaneGuides />
      
      <RetroSun />
    </>
  );
};
