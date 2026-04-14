export const GlobalStyles = () => (
  <style>{`
    :root {
        --H1-size: 61px;
        --H1-line-height: 96px;
        --H2-size: 39px;
        --H2-line-height: 64px;
        --H3-size: 30px;
        --H3-line-height: 48px;
        --H4-size: 25px;
        --H5-size: 20px;
        --H5-line-height: 32px;
        --Caption-size: 13px;
        --Caption-line-height: 24px;
        --Footnote-size: 10px;
        --Footnote-line-height: 16px;
    }
        html.lenis, html.lenis body {
  height: auto;
}
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
    
    * {
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto !important;
      background: #020203;
      font-family: 'Inter', sans-serif;
      overscroll-behavior-y: none;
    }
    
    #root {
        min-height: 100vh;
        width: 100%;
    }
    
    @keyframes pulse-dot {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(229, 127, 77, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(229, 127, 77, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(229, 127, 77, 0); }
    }
    
    .pulsing-dot {
      animation: pulse-dot 2s infinite;
    }

    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #020203; 
    }
    
    ::-webkit-scrollbar-thumb {
        background: #333; 
        border-radius: 4px;
    }
 
    ::-webkit-scrollbar-thumb:hover {
        background: #555; 
    }
        
        
  `}</style>
);