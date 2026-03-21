import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/encryption';

// Helper to verify admin
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { id: user.id },
                select: { role: true }
            });
            isAdmin = profile?.role === 'admin';
        } catch (e) {
            console.error('Admin API DB fallback error:', e);
        }
    }
    if (!isAdmin) return null;

    return user;
}

// GET /api/admin/api-config — List all API configs
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const configs = await prisma.apiConfig.findMany({
            orderBy: { created_at: 'desc' },
        });

        // Mask API keys for security
        const maskedConfigs = configs.map((c) => {
            const clearKey = decrypt(c.api_key);
            return {
                ...c,
                api_key: clearKey.substring(0, 8) + '••••••••',
            };
        });

        return NextResponse.json(maskedConfigs);
    } catch (error) {
        console.error('Admin API config error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/api-config — Create new API config
export async function POST(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, provider, base_url, api_key, headers, status } = body;

        if (!name || !provider || !base_url || !api_key) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If setting as active, deactivate other configs
        if (status === 'active') {
            await prisma.apiConfig.updateMany({
                where: { status: 'active' },
                data: { status: 'inactive' },
            });
        }

        const config = await prisma.apiConfig.create({
            data: {
                name,
                provider,
                base_url,
                api_key: encrypt(api_key),
                headers: headers || null,
                status: status || 'inactive',
            },
        });

        const clearKey = decrypt(config.api_key);
        return NextResponse.json({ ...config, api_key: clearKey.substring(0, 8) + '••••••••' });
    } catch (error) {
        console.error('Admin API config create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/api-config — Update API config
export async function PUT(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, name, provider, base_url, api_key, headers, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        // If setting as active, deactivate other configs
        if (status === 'active') {
            await prisma.apiConfig.updateMany({
                where: { status: 'active', id: { not: id } },
                data: { status: 'inactive' },
            });
        }

        const config = await prisma.apiConfig.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(provider !== undefined && { provider }),
                ...(base_url !== undefined && { base_url }),
                ...(api_key !== undefined && !api_key.includes('••••••••') && { api_key: encrypt(api_key) }),
                ...(headers !== undefined && { headers }),
                ...(status !== undefined && { status }),
            },
        });

        const clearKey = decrypt(config.api_key);
        return NextResponse.json({ ...config, api_key: clearKey.substring(0, 8) + '••••••••' });
    } catch (error) {
        console.error('Admin API config update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/api-config?id=xxx
export async function DELETE(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await prisma.apiConfig.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin API config delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
