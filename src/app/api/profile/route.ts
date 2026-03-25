import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { checkAndResetCredits } from '@/lib/credits';
import {
    formatBirthDateForClient,
    isZodiacBirthHourValue,
    parseBirthDateInput,
    type ZodiacBirthHourValue,
} from '@/lib/birth-info';

function parseBirthDate(value: unknown): { hasValue: boolean; value: Date | null } {
    const parsed = parseBirthDateInput(value);
    if (parsed === undefined) {
        return { hasValue: false, value: null };
    }

    return { hasValue: true, value: parsed };
}

function parseBirthTime(value: unknown): { hasValue: boolean; value: ZodiacBirthHourValue | null } {
    if (value === undefined) {
        return { hasValue: false, value: null };
    }

    if (value === null || value === '') {
        return { hasValue: true, value: null };
    }

    if (typeof value !== 'string' || !isZodiacBirthHourValue(value)) {
        throw new Error('INVALID_BIRTH_TIME');
    }

    return { hasValue: true, value };
}

function toClientProfile<T extends { birth_date?: Date | string | null }>(profile: T) {
    return {
        ...profile,
        birth_date: formatBirthDateForClient(profile.birth_date),
    };
}

// GET /api/profile
// Auto-creates profile if it doesn't exist yet
export async function GET() {
    // Get user info strictly from Supabase Auth to prevent IDOR
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    try {
        let profile = await prisma.profile.findUnique({
            where: { id: userId },
        });

        // Auto-create profile if it doesn't exist
        if (!profile) {
            if (user) {
                profile = await prisma.profile.create({
                    data: {
                        id: user.id,
                        email: user.email || '',
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                        role: 'user',
                    },
                });
            } else {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
            }
        }

        // Lazy reset: check and reset daily credits
        profile = await checkAndResetCredits(userId) || profile;

        return NextResponse.json(toClientProfile(profile));
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/profile — Create profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, full_name } = body;
        const birthDate = parseBirthDate(body.birth_date);
        const birthTime = parseBirthTime(body.birth_time);

        const safeEmail = typeof email === 'string' && email.trim()
            ? email.trim()
            : (user.email || '');

        if (!safeEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const profile = await prisma.profile.upsert({
            where: { id: user.id },
            update: {
                email: safeEmail,
                full_name: typeof full_name === 'string' ? full_name : null,
                ...(birthDate.hasValue && { birth_date: birthDate.value }),
                ...(birthTime.hasValue && { birth_time: birthTime.value }),
            },
            create: {
                id: user.id,
                email: safeEmail,
                full_name: typeof full_name === 'string' ? full_name : null,
                role: 'user',
                ...(birthDate.hasValue && { birth_date: birthDate.value }),
                ...(birthTime.hasValue && { birth_time: birthTime.value }),
            },
        });

        return NextResponse.json(toClientProfile(profile));
    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_BIRTH_DATE') {
            return NextResponse.json(
                { error: 'Ngày sinh không hợp lệ' },
                { status: 400 }
            );
        }

        if (error instanceof Error && error.message === 'INVALID_BIRTH_TIME') {
            return NextResponse.json({ error: 'Giờ sinh không hợp lệ' }, { status: 400 });
        }

        console.error('Profile create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/profile — Update profile
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { full_name, avatar_url } = body;
        const birthDate = parseBirthDate(body.birth_date);
        const birthTime = parseBirthTime(body.birth_time);

        const updateData = {
            ...(full_name !== undefined && { full_name }),
            ...(avatar_url !== undefined && { avatar_url }),
            ...(birthDate.hasValue && { birth_date: birthDate.value }),
            ...(birthTime.hasValue && { birth_time: birthTime.value }),
        };

        const profile = await prisma.profile.upsert({
            where: { id: user.id },
            update: updateData,
            create: {
                id: user.id,
                email: user.email || '',
                role: 'user',
                full_name:
                    full_name !== undefined
                        ? full_name
                        : user.user_metadata?.full_name || user.user_metadata?.name || null,
                ...(avatar_url !== undefined && { avatar_url }),
                ...(birthDate.hasValue && { birth_date: birthDate.value }),
                ...(birthTime.hasValue && { birth_time: birthTime.value }),
            },
        });

        return NextResponse.json(toClientProfile(profile));
    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_BIRTH_DATE') {
            return NextResponse.json(
                { error: 'Ngày sinh không hợp lệ' },
                { status: 400 }
            );
        }

        if (error instanceof Error && error.message === 'INVALID_BIRTH_TIME') {
            return NextResponse.json({ error: 'Giờ sinh không hợp lệ' }, { status: 400 });
        }

        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
