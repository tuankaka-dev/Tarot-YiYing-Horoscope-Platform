'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AutoLogout() {
    const { signOut, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) return; // Only track logged in users

        let timeout: NodeJS.Timeout;

        const handleTimeout = async () => {
            await signOut();
            toast.error('Phiên đăng nhập đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.');
            router.refresh();
            router.push('/login');
        };

        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(handleTimeout, INACTIVITY_TIMEOUT);
        };

        // Listen to standard interaction events
        window.addEventListener('mousemove', resetTimeout);
        window.addEventListener('keypress', resetTimeout);
        window.addEventListener('scroll', resetTimeout);
        window.addEventListener('click', resetTimeout);

        resetTimeout();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetTimeout);
            window.removeEventListener('keypress', resetTimeout);
            window.removeEventListener('scroll', resetTimeout);
            window.removeEventListener('click', resetTimeout);
        };
    }, [user, signOut, router]);

    return null;
}
