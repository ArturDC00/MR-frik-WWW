// ============================================================
// RWD HERO SECTION - Responsive Breakpoints & Settings
// ============================================================

// Detect device type and screen size
export function detectDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && width >= 768;

    if (width < 768) return 'MOBILE';
    if (width >= 768 && width < 1024) return 'TABLET';
    return 'DESKTOP';
}

// Responsive camera positions for different devices
export const CAMERA_POSITIONS = {
    MOBILE: {
        hero: {
            position: [0, 25, 110],      // Dalej i wyżej (więcej globusa w kadrze)
            fov: 50,                     // Szerszy FOV
            lookAt: [0, 0, 0],
        },
        intro_start: {
            position: [0, 15, 100],
            fov: 50,
        },
        intro_end: {
            position: [0, 30, 100],
            fov: 50,
        }
    },
    TABLET: {
        hero: {
            position: [-15, 30, 100],
            fov: 45,
            lookAt: [0, 0, 0],
        },
        intro_start: {
            position: [0, 15, 90],
            fov: 45,
        },
        intro_end: {
            position: [-15, 30, 100],
            fov: 45,
        }
    },
    DESKTOP: {
        hero: {
            position: [-20, 35, 95],     // Oryginalna pozycja
            fov: 42,
            lookAt: [0, 0, 0],
        },
        intro_start: {
            position: [0, 15, 80],
            fov: 42,
        },
        intro_end: {
            position: [-20, 35, 95],
            fov: 42,
        }
    }
};

// Responsive UI settings
export const UI_SETTINGS = {
    MOBILE: {
        heroTitle: {
            fontSize: 'clamp(32px, 8vw, 48px)',
            lineHeight: '1.2',
            padding: '0 20px',
            maxWidth: '90%',
        },
        heroSubtitle: {
            fontSize: 'clamp(16px, 4vw, 20px)',
            padding: '0 20px',
            maxWidth: '90%',
        },
        navButtons: {
            display: 'none',            // Hide on mobile
        },
        globeInteractionHint: {
            bottom: '80px',
            fontSize: '14px',
        }
    },
    TABLET: {
        heroTitle: {
            fontSize: 'clamp(48px, 6vw, 64px)',
            lineHeight: '1.2',
            padding: '0 40px',
            maxWidth: '80%',
        },
        heroSubtitle: {
            fontSize: 'clamp(18px, 3vw, 24px)',
            padding: '0 40px',
            maxWidth: '80%',
        },
        navButtons: {
            display: 'flex',
            right: '20px',
            gap: '8px',
        },
        globeInteractionHint: {
            bottom: '100px',
            fontSize: '15px',
        }
    },
    DESKTOP: {
        heroTitle: {
            fontSize: 'clamp(64px, 5vw, 82px)',
            lineHeight: '1.1',
            padding: '0 60px',
            maxWidth: '70%',
        },
        heroSubtitle: {
            fontSize: 'clamp(20px, 2vw, 28px)',
            padding: '0 60px',
            maxWidth: '70%',
        },
        navButtons: {
            display: 'flex',
            right: '32px',
            gap: '12px',
        },
        globeInteractionHint: {
            bottom: '120px',
            fontSize: '16px',
        }
    }
};

// Touch controls settings
export const TOUCH_SETTINGS = {
    MOBILE: {
        enableRotate: true,
        enableZoom: true,
        enablePan: false,
        rotateSpeed: 0.3,         // Wolniejszy obrót na mobile
        zoomSpeed: 0.5,
        minDistance: 60,
        maxDistance: 130,
    },
    TABLET: {
        enableRotate: true,
        enableZoom: true,
        enablePan: false,
        rotateSpeed: 0.4,
        zoomSpeed: 0.7,
        minDistance: 50,
        maxDistance: 140,
    },
    DESKTOP: {
        enableRotate: true,
        enableZoom: true,
        enablePan: false,
        rotateSpeed: 0.5,
        zoomSpeed: 1.0,
        minDistance: 50,
        maxDistance: 150,
    }
};

// Responsive canvas settings
export const CANVAS_RWD_SETTINGS = {
    MOBILE: {
        dpr: [0.75, 1],           // Niższa rozdzielczość na mobile
        antialias: false,
        shadows: false,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    },
    TABLET: {
        dpr: [1, 1.5],
        antialias: true,
        shadows: false,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    },
    DESKTOP: {
        dpr: [1, 2],
        antialias: true,
        shadows: false,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    }
};

// Orientation detection and handling
export function detectOrientation() {
    if (window.innerHeight > window.innerWidth) {
        return 'PORTRAIT';
    }
    return 'LANDSCAPE';
}

// Adaptive scaling for different aspect ratios
export function getAdaptiveScale(deviceType, orientation) {
    if (deviceType === 'MOBILE' && orientation === 'PORTRAIT') {
        return 1.2; // Większy globus na mobile portrait
    }
    if (deviceType === 'MOBILE' && orientation === 'LANDSCAPE') {
        return 0.9; // Mniejszy na mobile landscape
    }
    if (deviceType === 'TABLET' && orientation === 'PORTRAIT') {
        return 1.1;
    }
    return 1.0; // Desktop i tablet landscape
}

// Responsive scroll threshold
export function getScrollThreshold(deviceType) {
    switch (deviceType) {
        case 'MOBILE':
            return 0.4;  // Szybszy fade na mobile
        case 'TABLET':
            return 0.35;
        case 'DESKTOP':
        default:
            return 0.3;
    }
}

// Safe area insets for notch devices (iPhone X+)
export function getSafeAreaInsets() {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
    };
}