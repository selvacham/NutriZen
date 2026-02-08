import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
    user: any | null;
    profile: any | null;
    hasProfile: boolean;
    loading: boolean;
    isSigningOut: boolean;  // 👈 NEW: Track if we are intentionally signing out
    setUser: (user: any) => void;
    setProfile: (profile: any) => void;
    setHasProfile: (hasProfile: boolean) => void;
    setLoading: (loading: boolean) => void;
    signOut: () => Promise<void>;
    reset: () => void;
    fetchProfile: (userId: string, accessToken?: string | null) => Promise<void>;
    saveProfile: (profile: any) => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    hasProfile: false,
    loading: true,
    isSigningOut: false, // 👈 Default false

    setUser: (user) => {
        console.log('[AuthStore] setUser called:', user?.id);
        set({ user });
    },
    setProfile: (profile) => {
        set({
            profile,
            hasProfile: !!profile
        });
    },
    setHasProfile: (hasProfile: boolean) => set({ hasProfile }),
    setLoading: (loading) => set({ loading }),

    signOut: async () => {
        // 1. Set Flag & Clear local state IMMEDIATELY
        console.log('[AuthStore] Clearing session state (Optimistic)');
        console.trace('[AuthStore] signOut called from:');
        console.trace('[AuthStore] signOut called from:');
        set({ user: null, profile: null, hasProfile: false, isSigningOut: true }); // 👈 Set flag

        // 2. Call Supabase signout
        try {
            console.log('[AuthStore] Sending signOut request to Supabase...');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            console.log('[AuthStore] Supabase signOut complete');
        } catch (error) {
            console.warn('[AuthStore] Supabase signOut failed (network issue?), but local session cleared.', error);
        } finally {
            // Reset flag after a delay to allow ghost events to pass
            console.log(`[AuthStore] Scheduling isSigningOut reset (in 2s). Time: ${Date.now()}`);
            setTimeout(() => {
                const { isSigningOut } = get();
                console.log(`[AuthStore] Resetting isSigningOut flag. Time: ${Date.now()}. Was: ${isSigningOut}`);
                if (isSigningOut) {
                    set({ isSigningOut: false });
                }
            }, 2000);
        }
    },

    reset: () => {
        console.log('[AuthStore] Resetting session state (listener triggered)');
        set({ user: null, profile: null, hasProfile: false });
    },

    fetchProfile: async (userId) => {
        try {
            //console.log('[AuthStore] Fetching profile for:', userId);

            // 5s timeout to prevent infinite hanging
            const { data, error } = await Promise.race([
                supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
                )
            ]) as any;

            if (data) {
                //console.log('[AuthStore] ✅ Profile loaded:', data.id);
                set({ profile: data, hasProfile: true });
            } else {
                if (error && error.code !== 'PGRST116') {
                    console.warn('[AuthStore] Fetch profile error/timeout:', error.message || 'Unknown error');
                }
                set({ profile: null, hasProfile: false });
            }
        } catch (err: any) {
            console.warn('[AuthStore] Fetch profile exception:', err.message);
            set({ profile: null, hasProfile: false });
        } finally {
            set({ loading: false });
        }
    },

    saveProfile: async (profile) => {
        try {
            set({ loading: true });
            console.log('[AuthStore] Saving profile...', profile.id);

            const { data, error } = await supabase
                .from('user_profiles')
                .upsert(profile)
                .select()
                .single();

            if (error) throw error;

            console.log('[AuthStore] Profile saved:', data);
            set({ profile: data, hasProfile: true });

        } catch (error) {
            console.error('[AuthStore] SaveProfile error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // 👇 CRITICAL: Session recovery + profile check
    initializeAuth: async () => {
        try {
            set({ loading: true });

            // 1. Get current session
            const { data: { session } } = await supabase.auth.getSession();
            console.log('[AuthStore] initializeAuth -> Session found:', session?.user?.id);

            if (session?.user) {
                set({ user: session.user });
                // 2. Check profile exists
                await get().fetchProfile(session.user.id);
                return;
            }

            // No session
            set({ user: null, profile: null, hasProfile: false });

        } catch (error) {
            console.error('[AuthStore] Init error:', error);
        } finally {
            set({ loading: false });
        }
    },
}));
