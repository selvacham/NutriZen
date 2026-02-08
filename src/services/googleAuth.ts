import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
    try {
        const redirectUrl = makeRedirectUri({
            path: 'auth/callback',
        });

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: false,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                },
            },
        });

        if (error) throw error;

        // Open the OAuth URL in browser
        if (data?.url) {
            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectUrl
            );

            if (result.type === 'success' && result.url) {
                // Manually parse the session from the URL
                const params = extractParamsFromUrl(result.url);

                if (params.access_token && params.refresh_token) {
                    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                        access_token: params.access_token,
                        refresh_token: params.refresh_token,
                    });

                    if (sessionError) throw sessionError;

                    console.log('Google Auth Success. User:', sessionData.user?.email);
                    return { success: true };
                }
            } else if (result.type === 'cancel') {
                return { success: false, error: 'User cancelled' };
            }
        }

        return { success: false, error: 'No URL returned or session failed' };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error };
    }
}

// Helper to extract params from URL fragment
function extractParamsFromUrl(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    // Handle both query (?) and fragment (#)
    const queryString = url.split('#')[1] || url.split('?')[1];

    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                params[key] = decodeURIComponent(value);
            }
        });
    }

    return params;
}
