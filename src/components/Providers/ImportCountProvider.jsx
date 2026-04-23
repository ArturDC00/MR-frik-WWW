'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ImportCountContext = createContext({
    targetCount: 2200,
    ready: false,
});

export function ImportCountProvider({ children }) {
    const [targetCount, setTargetCount] = useState(2200);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/import-count')
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
            .then((data) => {
                if (cancelled) return;
                const n = typeof data?.count === 'number' && !Number.isNaN(data.count) ? data.count : 2200;
                setTargetCount(Math.max(2200, n));
                setReady(true);
            })
            .catch(() => {
                if (!cancelled) {
                    setTargetCount(2200);
                    setReady(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo(() => ({ targetCount, ready }), [targetCount, ready]);

    return <ImportCountContext.Provider value={value}>{children}</ImportCountContext.Provider>;
}

export function useImportCountTarget() {
    return useContext(ImportCountContext);
}
