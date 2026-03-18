'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'oklch(0.15 0.025 280)',
                        border: '1px solid oklch(0.25 0.04 280)',
                        color: 'oklch(0.93 0.01 280)',
                    },
                }}
            />
        </>
    );
}
