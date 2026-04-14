import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export function ScrollytellingController({
    globeRef,
    isActive = true,
    sections = []
}) {
    const { camera } = useThree();
    const targetCameraPos = useRef(new THREE.Vector3(0, 0, 100));
    const targetGlobeRot = useRef(new THREE.Euler(0, 0, 0));

    useEffect(() => {
        if (!isActive) return;

        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        const defaultSections = [
            {
                trigger: '.process-section',
                camera: { x: -40, y: 30, z: 110 },
                globeRotation: { x: 0.2, y: -1.2, z: 0 }
            },
            {
                trigger: '.values-section',
                camera: { x: 50, y: 20, z: 90 },
                globeRotation: { x: 0, y: 0.8, z: 0 }
            },
            {
                trigger: '.trust-section',
                camera: { x: 0, y: 60, z: 95 },
                globeRotation: { x: 0.5, y: 1.5, z: 0 }
            },
            {
                trigger: '.faq-section',
                camera: { x: 0, y: 10, z: 120 },
                globeRotation: { x: 0, y: 2.0, z: 0 }
            }
        ];

        const sectionsToUse = sections.length > 0 ? sections : defaultSections;

        sectionsToUse.forEach((section) => {
            // Sprawdź czy element istnieje zanim dodasz trigger
            if (!document.querySelector(section.trigger)) return;

            ScrollTrigger.create({
                trigger: section.trigger,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => {
                    targetCameraPos.current.set(
                        section.camera.x,
                        section.camera.y,
                        section.camera.z
                    );
                    targetGlobeRot.current.set(
                        section.globeRotation.x,
                        section.globeRotation.y,
                        section.globeRotation.z
                    );
                },
                onEnterBack: () => {
                    targetCameraPos.current.set(
                        section.camera.x,
                        section.camera.y,
                        section.camera.z
                    );
                    targetGlobeRot.current.set(
                        section.globeRotation.x,
                        section.globeRotation.y,
                        section.globeRotation.z
                    );
                }
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [isActive, sections]);

    useFrame(() => {
        if (!isActive) return;

        const lerpFactor = 0.05;

        camera.position.lerp(targetCameraPos.current, lerpFactor);

        if (globeRef?.current) {
            globeRef.current.rotation.x = THREE.MathUtils.lerp(
                globeRef.current.rotation.x,
                targetGlobeRot.current.x,
                lerpFactor
            );
            globeRef.current.rotation.y = THREE.MathUtils.lerp(
                globeRef.current.rotation.y,
                targetGlobeRot.current.y,
                lerpFactor
            );
            globeRef.current.rotation.z = THREE.MathUtils.lerp(
                globeRef.current.rotation.z,
                targetGlobeRot.current.z,
                lerpFactor
            );
        }
    });

    return null;
}