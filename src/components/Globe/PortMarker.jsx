import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '../../utils/math';
import { GLOBE_RADIUS } from '../../constants/config';
import { COLORS } from '../../constants/colors';
import { PORTS } from '../../constants/ports';

// ============================================================
// PERFORMANCE DETECTION
// ============================================================
function detectPerformanceTier() {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (cores < 4 || memory < 4 || isMobile) return 'LOW';
    if (cores <= 8 && memory <= 8) return 'MID';
    return 'HIGH';
}

const PORT_QUALITY = {
    LOW: {
        pinSegments: 16,
        ringSegments: 16,
        enableGlow: false,
        updateFrequency: 3,
    },
    MID: {
        pinSegments: 24,
        ringSegments: 24,
        enableGlow: true,
        updateFrequency: 2,
    },
    HIGH: {
        pinSegments: 32,
        ringSegments: 32,
        enableGlow: true,
        updateFrequency: 1,
    }
};

// ============================================================
// SINGLE PORT MARKER (for individual rendering if needed)
// ============================================================
export function PortMarker({ port }) {
    const pinRef = useRef();
    const glowRef = useRef();
    const [perfTier] = useState(() => detectPerformanceTier());
    const quality = PORT_QUALITY[perfTier];

    const position = useMemo(() => {
        return latLngToVector3(port.lat, port.lng, GLOBE_RADIUS);
    }, [port]);

    const quaternion = useMemo(() => {
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.lookAt(0, 0, 0);
        return dummy.quaternion;
    }, [position]);

    const frameCount = useRef(0);
    useFrame((state) => {
        frameCount.current++;
        if (frameCount.current % quality.updateFrequency !== 0) return;

        const t = state.clock.elapsedTime;

        // Levitation
        if (pinRef.current) {
            const float = Math.sin(t * 2.0) * 0.2;
            pinRef.current.position.z = 1.2 + float;
        }

        // Glow pulse (only on MID/HIGH)
        if (glowRef.current && quality.enableGlow) {
            const pulse = 0.8 + Math.sin(t * 2.0) * 0.2;
            glowRef.current.scale.set(pulse, pulse, pulse);
            glowRef.current.material.opacity = 0.6 - Math.sin(t * 2.0) * 0.1;
        }
    });

    return (
        <group position={position} quaternion={quaternion}>
            {/* Pin (moving part) */}
            <group ref={pinRef} rotation={[Math.PI / 2, 0, 0]}>
                {/* Pin head */}
                <mesh position={[0, 0.4, 0]}>
                    <sphereGeometry args={[0.35, quality.pinSegments, quality.pinSegments]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        emissive="#ffffff"
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.1}
                    />
                </mesh>

                {/* Pin leg */}
                <mesh position={[0, -0.6, 0]}>
                    <cylinderGeometry args={[0.02, 0.01, 1.5, 8]} />
                    <meshBasicMaterial color={COLORS.gradientEnd} transparent opacity={0.6} />
                </mesh>
            </group>

            {/* Glow on surface (only MID/HIGH) */}
            {quality.enableGlow && (
                <mesh ref={glowRef} position={[0, 0, 0.05]} rotation={[0, 0, 0]}>
                    <ringGeometry args={[0.1, 0.7, quality.ringSegments]} />
                    <meshBasicMaterial
                        color={COLORS.gradientEnd}
                        transparent
                        opacity={0.5}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}

            {/* Center dot */}
            <mesh position={[0, 0, 0.02]}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
        </group>
    );
}

// ============================================================
// INSTANCED PORT MARKERS - All ports in 1 draw call
// ============================================================
export function InstancedPortMarkers({ onPortClick }) {
    const pinsRef = useRef();
    const glowsRef = useRef();
    const dotsRef = useRef();
    const dummyRef = useRef(new THREE.Object3D());

    const [perfTier] = useState(() => detectPerformanceTier());
    const quality = PORT_QUALITY[perfTier];

    // Prepare port data
    const portData = useMemo(() => {
        return PORTS.map(port => {
            const position = latLngToVector3(port.lat, port.lng, GLOBE_RADIUS);
            const dummy = new THREE.Object3D();
            dummy.position.copy(position);
            dummy.lookAt(0, 0, 0);

            return {
                id: port.id,
                position,
                quaternion: dummy.quaternion.clone(),
                port
            };
        });
    }, []);

    const totalPorts = portData.length;

    // Throttled animation
    const frameCount = useRef(0);
    useFrame((state) => {
        frameCount.count++;
        if (frameCount.current % quality.updateFrequency !== 0) return;

        const t = state.clock.elapsedTime;

        portData.forEach((data, idx) => {
            // Pin levitation
            if (pinsRef.current) {
                const float = Math.sin(t * 2.0 + idx * 0.5) * 0.2;
                dummyRef.current.position.copy(data.position);
                dummyRef.current.quaternion.copy(data.quaternion);
                dummyRef.current.position.add(
                    dummyRef.current.up.clone().multiplyScalar(1.2 + float)
                );
                dummyRef.current.rotation.x = Math.PI / 2;
                dummyRef.current.updateMatrix();
                pinsRef.current.setMatrixAt(idx, dummyRef.current.matrix);
            }

            // Glow pulse (only MID/HIGH)
            if (glowsRef.current && quality.enableGlow) {
                const pulse = 0.8 + Math.sin(t * 2.0 + idx * 0.5) * 0.2;
                dummyRef.current.position.copy(data.position);
                dummyRef.current.quaternion.copy(data.quaternion);
                dummyRef.current.position.add(
                    dummyRef.current.up.clone().multiplyScalar(0.05)
                );
                dummyRef.current.scale.set(pulse, pulse, pulse);
                dummyRef.current.updateMatrix();
                glowsRef.current.setMatrixAt(idx, dummyRef.current.matrix);
            }

            // Center dots (static)
            if (dotsRef.current && idx === 0) { // Set once
                dummyRef.current.position.copy(data.position);
                dummyRef.current.quaternion.copy(data.quaternion);
                dummyRef.current.position.add(
                    dummyRef.current.up.clone().multiplyScalar(0.02)
                );
                dummyRef.current.updateMatrix();
                dotsRef.current.setMatrixAt(idx, dummyRef.current.matrix);
            }
        });

        if (pinsRef.current) pinsRef.current.instanceMatrix.needsUpdate = true;
        if (glowsRef.current) glowsRef.current.instanceMatrix.needsUpdate = true;
        if (dotsRef.current && frameCount.current === quality.updateFrequency) {
            dotsRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group name="instanced-ports">
            {/* Instanced Pin Heads */}
            <instancedMesh ref={pinsRef} args={[null, null, totalPorts]} frustumCulled={true}>
                <sphereGeometry args={[0.35, quality.pinSegments, quality.pinSegments]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                    roughness={0.2}
                    metalness={0.1}
                />
            </instancedMesh>

            {/* Instanced Glows (only MID/HIGH) */}
            {quality.enableGlow && (
                <instancedMesh ref={glowsRef} args={[null, null, totalPorts]} frustumCulled={true}>
                    <ringGeometry args={[0.1, 0.7, quality.ringSegments]} />
                    <meshBasicMaterial
                        color={COLORS.gradientEnd}
                        transparent
                        opacity={0.5}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </instancedMesh>
            )}

            {/* Instanced Center Dots */}
            <instancedMesh ref={dotsRef} args={[null, null, totalPorts]} frustumCulled={true}>
                <circleGeometry args={[0.15, 16]} />
                <meshBasicMaterial color="#fff" />
            </instancedMesh>

            {/* Individual clickable hitboxes - necessary for interaction */}
            {portData.map((data, idx) => (
                <mesh
                    key={data.id}
                    visible={false}
                    position={data.position}
                    quaternion={data.quaternion}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPortClick(data.port);
                    }}
                >
                    <sphereGeometry args={[2.5, 8, 8]} />
                </mesh>
            ))}
        </group>
    );
}