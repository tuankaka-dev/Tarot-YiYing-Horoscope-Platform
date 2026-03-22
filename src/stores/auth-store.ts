import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import type { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signInWithGoogle: () => Promise<{ error?: string }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,

    initialize: async () => {
        const supabase = createClient();
        // Use getUser() instead of getSession() for reliable server-side auth
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Set user immediately, don't wait for profile
            set({ user, isLoading: false });
            // Fetch profile in background (non-blocking)
            get().fetchProfile();
        } else {
            set({ isLoading: false });
        }

        // Listen for auth changes including token refresh
        supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                set({ user: session.user });
                // Only fetch profile on initial sign in, not on every token refresh
                if (event === 'SIGNED_IN') {
                    get().fetchProfile();
                }
            } else if (event === 'SIGNED_OUT') {
                set({ user: null, profile: null });
            }
        });
    },

    signIn: async (email, password) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        // Update store immediately after successful login
        if (data.user) {
            set({ user: data.user });
            await get().fetchProfile();
        }
        return {};
    },

    signInWithGoogle: async () => {
        const supabase = createClient();
        const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const redirectBase =
            configuredBaseUrl &&
            /^https?:\/\//i.test(configuredBaseUrl) &&
            !(configuredBaseUrl.includes('localhost') && window.location.hostname !== 'localhost')
                ? configuredBaseUrl.replace(/\/$/, '')
                : window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${redirectBase}/auth/callback`,
            },
        });
        if (error) return { error: error.message };
        return {};
    },

    signUp: async (email, password, fullName) => {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        if (error) return { error: error.message };

        return {};
    },

    signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },

    fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const profile = await response.json();
                set({ profile });
            }
        } catch (e) {
            console.error('Failed to fetch profile:', e);
        }
    },
}));
