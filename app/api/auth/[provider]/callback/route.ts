import { NextResponse } from 'next/server';
import { PROVIDERS, getOAuthStateCookie, clearOAuthStateCookie, getRedirectUri } from '@/lib/auth/oauth';
import { createSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { sendLoginEmail, sendWelcomeEmail } from '@/lib/brevo';
export async function GET(request: Request, { params }: { params: { provider: string } }) {
    const provider = params.provider.toLowerCase();
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(error)}`);
    }

    if (!PROVIDERS[provider]) {
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const config = PROVIDERS[provider];
    const savedState = getOAuthStateCookie();
    clearOAuthStateCookie();

    if (!code || !state || state !== savedState) {
        return NextResponse.redirect(`${url.origin}/login?error=InvalidState`);
    }

    const redirectUri = getRedirectUri(provider, url.origin);

    try {
        // 1. Exchange code for access token
        const tokenParams = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const tokenRes = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: tokenParams.toString(),
            cache: 'no-store',
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error || !tokenData.access_token) {
            console.error(`[OAuth] Token Error (${provider}):`, tokenData);
            return NextResponse.redirect(`${url.origin}/login?error=TokenExchangeFailed`);
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch user profile
        const profileHeaders: Record<string, string> = {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
        };

        const profileRes = await fetch(config.profileUrl, { headers: profileHeaders, cache: 'no-store' });
        const profileData = await profileRes.json();

        // 3. Extract standardized user info
        let email = '';
        let name = '';
        let avatar = '';
        let providerId = '';

        if (provider === 'google') {
            email = profileData.email;
            name = profileData.name;
            avatar = profileData.picture;
            providerId = profileData.id;
        } else if (provider === 'github') {
            email = profileData.email;
            name = profileData.name || profileData.login;
            avatar = profileData.avatar_url;
            providerId = String(profileData.id);

            if (!email) {
                const emailsRes = await fetch('https://api.github.com/user/emails', {
                    headers: profileHeaders,
                    cache: 'no-store',
                });
                const emailsData = await emailsRes.json();
                const primary = emailsData.find((e: { primary: boolean; email: string }) => e.primary) || emailsData[0];
                email = primary?.email;
            }
        } else if (provider === 'discord') {
            email = profileData.email;
            name = profileData.username;
            avatar = profileData.avatar
                ? `https://cdn.discordapp.com/avatars/${profileData.id}/${profileData.avatar}.png`
                : '';
            providerId = profileData.id;
        }

        if (!email) {
            return NextResponse.redirect(`${url.origin}/login?error=EmailRequired`);
        }

        // 4. Upsert user — check by email first, create minimal record if new
        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as { data: any; error: any };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let userRecord: any = existingUser;

        if (!userRecord) {
            // New user — create minimal record, no phone_number required
            console.log(`[OAuth] Creating new user: ${email} via ${provider}`);

            const { data: newUser, error: insertError } = await supabase
                .from('users')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .insert({
                    email,
                    full_name: name,
                    avatar_url: avatar,
                    provider,
                    provider_id: providerId,
                    role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
                    is_blocked: false,
                    terms_accepted: false,
                    profile_completed: false,
                    // phone_number intentionally omitted — collected in /complete-profile
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)
                .select()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .single() as { data: any; error: any };

            if (insertError) {
                // Insert failed — try fetching by email (possible race condition / duplicate)
                console.warn('[OAuth] Insert failed, checking for existing user:', insertError.message, insertError.code);

                const { data: fallbackUser, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .single() as { data: any; error: any };

                if (fetchError || !fallbackUser) {
                    console.error('[OAuth] Fatal: could not create or find user.', {
                        insertError,
                        fetchError,
                        email,
                        provider,
                    });
                    return NextResponse.redirect(`${url.origin}/login?error=CreateAccountFailed`);
                }

                userRecord = fallbackUser;
            } else {
                userRecord = newUser;
            }

            // --- PROACTIVE FIX: Send Welcome Email for new OAuth users ---
            sendWelcomeEmail(email, name).catch(e => console.error('[OAuth] Welcome email error:', e));
        } else {
            // Existing user — refresh avatar/name and re-assert admin role on each login
            const correctRole = email === process.env.ADMIN_EMAIL ? 'admin' : (userRecord.role ?? 'user');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('users')
                .update({ avatar_url: avatar, full_name: name, role: correctRole })
                .eq('id', userRecord.id);
            userRecord.role = correctRole;

            // --- PROACTIVE FIX: Send Login Email for returning OAuth users ---
            sendLoginEmail(email, name).catch(e => console.error('[OAuth] Login email error:', e));
        }

        // 5. Issue JWT session
        await createSession({
            userId: userRecord.id,
            role: userRecord.role ?? 'user',
            isBlocked: userRecord.is_blocked ?? false,
            termsAccepted: userRecord.terms_accepted ?? false,
            profileCompleted: userRecord.profile_completed ?? false,
            provider,
        });

        // 6. Redirect based on profile completion
        if (!userRecord.profile_completed) {
            return NextResponse.redirect(`${url.origin}/complete-profile`);
        }

        return NextResponse.redirect(`${url.origin}/dashboard`);

    } catch (e) {
        console.error('[OAuth] Callback Error:', e);
        return NextResponse.redirect(`${url.origin}/login?error=UnknownError`);
    }
}
