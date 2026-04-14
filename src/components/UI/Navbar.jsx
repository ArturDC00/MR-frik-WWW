import { motion } from 'framer-motion';
import { LOGO_PATH } from '../../constants/config';

export function Navbar({ scrolled }) {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'fixed',
                top: '48px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                padding: '8px 5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: scrolled ? 'rgba(230, 230, 230, 0.15)' : 'rgba(230, 230, 230, 0.2)',
                backdropFilter: 'blur(20px)',
                borderRadius: '14px',
                width: '509px',
                height: '72px',
                transition: 'all 0.3s ease',
                pointerEvents: 'auto'
            }}
        >
            <div style={{
                height: '42px',
                width: '146px',
                opacity: 0.38,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                marginLeft: '5px'
            }}>
                <img
                    src={LOGO_PATH}
                    alt="Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>

            <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                marginRight: '20px'
            }}>
                <button style={{
                    background: 'rgba(0, 0, 0, 0.29)',
                    border: 'none',
                    padding: '0 16px',
                    borderRadius: '6px',
                    color: 'rgba(255, 255, 255, 0.48)',
                    fontSize: '13px',
                    fontWeight: '510',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.21,
                    whiteSpace: 'nowrap',
                    minWidth: '105px'
                }}>
                    Menu
                </button>

                <button
                    style={{
                        background: 'rgba(0, 0, 0, 0.85)',
                        border: 'none',
                        padding: '0 16px',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '510',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        minWidth: '98px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.95)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.85)'}
                >
                    Licytuj
                </button>
            </div>
        </motion.nav>
    );
}