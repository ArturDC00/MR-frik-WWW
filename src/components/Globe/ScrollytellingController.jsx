import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Pozycje kamery dla każdej sekcji - EDYTUJ WEDŁUG POTRZEB
// Nazwy selectorów muszą pasować do klas w App.jsx!
const CAMERA_SCENES = [
    {
        selector: '.hero-section',
        cam: [-20, 35, 95],    // Identyczne z endPos w CameraController!
        rot: [0, 0, 0]
    },
    {
        selector: '.process-section',
        cam: [0, 40, 55],      // Widok z góry na Atlantyk (trasy statków)
        rot: [0, -1.0, 0]
    },
    {
        selector: '.values-section',
        cam: [50, 20, 65],     // Zbliżenie na USA/Kanadę
        rot: [0, 1.0, 0]
    },
    {
        selector: '.trust-section',
        cam: [-35, 25, 70],    // Zbliżenie na Europę
        rot: [0.2, -0.4, 0]
    },
    {
        selector: '.faq-section',
        cam: [0, 10, 130],     // Oddalenie - pełny globus
        rot: [0, 2.0, 0]
    }
];

export function ScrollytellingController({ globeRef, isActive = true }) {
    const { camera } = useThree();

    // Startuje tam gdzie kończy CameraController (endPos = [-20, 35, 95])
    const targetCamPos = useRef(new THREE.Vector3(-20, 35, 95));
    const targetGlobeRot = useRef(new THREE.Euler(0, 0, 0));

    useEffect(() => {
        if (!isActive) return;

        // Daj 500ms na załadowanie DOM zanim ScrollTrigger szuka elementów
        const timer = setTimeout(() => {
            ScrollTrigger.getAll().forEach(t => t.kill());

            CAMERA_SCENES.forEach(scene => {
                const el = document.querySelector(scene.selector);
                if (!el) return;

                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    // markers: true, // Odkomentuj do debugowania
                    onEnter: () => {
                        targetCamPos.current.set(...scene.cam);
                        targetGlobeRot.current.set(...scene.rot);
                    },
                    onEnterBack: () => {
                        targetCamPos.current.set(...scene.cam);
                        targetGlobeRot.current.set(...scene.rot);
                    }
                });
            });

            ScrollTrigger.refresh();
        }, 500);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [isActive]);

    useFrame(() => {
        if (!isActive) return;

        const lerp = 0.04;

        camera.position.lerp(targetCamPos.current, lerp);
        camera.lookAt(0, 0, 0);

        if (globeRef?.current) {
            globeRef.current.rotation.x = THREE.MathUtils.lerp(globeRef.current.rotation.x, targetGlobeRot.current.x, lerp);
            globeRef.current.rotation.y = THREE.MathUtils.lerp(globeRef.current.rotation.y, targetGlobeRot.current.y, lerp);
            globeRef.current.rotation.z = THREE.MathUtils.lerp(globeRef.current.rotation.z, targetGlobeRot.current.z, lerp);
        }
    });

    return null;
}