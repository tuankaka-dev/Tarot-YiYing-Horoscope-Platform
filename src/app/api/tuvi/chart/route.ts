import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { TuViEngine } from '@/lib/tuvi-engine';
import * as LunarTypescript from 'lunar-typescript';

function normalizeGender(value: string | null): 'male' | 'female' {
    return value === 'female' ? 'female' : 'male';
}

function toIsoDate(value: Date): string {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function normalizeNumber(value: string): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function buildLunarTypescriptProbe(input: {
    birthDateIso: string;
    hour: number;
    minute: number;
}) {
    const { birthDateIso, hour, minute } = input;
    const [yearRaw, monthRaw, dayRaw] = birthDateIso.split('-');
    const year = normalizeNumber(yearRaw);
    const month = normalizeNumber(monthRaw);
    const day = normalizeNumber(dayRaw);

    const hasZiWeiExport = Object.prototype.hasOwnProperty.call(LunarTypescript, 'ZiWei');
    const solar = LunarTypescript.Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    const probe = {
        package: 'lunar-typescript',
        hasZiWeiExport,
        sampleFromRequestedSnippet: (() => {
            const sampleSolar = LunarTypescript.Solar.fromYmdHms(2006, 11, 15, 16, 30, 0);
            const sampleLunar = sampleSolar.getLunar();
            return {
                input: { year: 2006, month: 11, day: 15, hour: 16, minute: 30, second: 0 },
                solarFullString: sampleSolar.toFullString(),
                lunarFullString: sampleLunar.toFullString(),
            };
        })(),
        sampleFromProfile: {
            input: { year, month, day, hour, minute, second: 0 },
            solarFullString: solar.toFullString(),
            lunarFullString: lunar.toFullString(),
        },
        requestedSnippetStatus: hasZiWeiExport
            ? 'ZiWei available'
            : 'ZiWei is not exported by this package version',
    };

    return probe;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: {
                birth_date: true,
                birth_time: true,
            },
        });

        if (!profile?.birth_date || !profile.birth_time) {
            return NextResponse.json(
                { error: 'Vui lòng cập nhật ngày sinh và giờ sinh trước khi lập lá số' },
                { status: 400 }
            );
        }

        const gender = normalizeGender(request.nextUrl.searchParams.get('gender'));
        const timezoneParam = request.nextUrl.searchParams.get('timezone');
        const timezone = timezoneParam ? Number(timezoneParam) : 7;
        const viewYearParam = request.nextUrl.searchParams.get('viewYear');
        const parsedViewYear = viewYearParam ? Number.parseInt(viewYearParam, 10) : Number.NaN;
        const viewYear = Number.isFinite(parsedViewYear) ? parsedViewYear : undefined;

        const engine = new TuViEngine(timezone);
        const input = TuViEngine.fromProfileInput({
            birthDateIso: toIsoDate(profile.birth_date),
            birthTimeValue: profile.birth_time,
            gender,
            timezone,
        });

        const chart = engine.generateChart(input, { viewYear });
        const probe = buildLunarTypescriptProbe({
            birthDateIso: toIsoDate(profile.birth_date),
            hour: input.hour ?? 12,
            minute: input.minute ?? 0,
        });

        return NextResponse.json({
            ok: true,
            chart: {
                ...chart,
                lunarTypescriptProbe: probe,
            },
        });
    } catch (error) {
        console.error('TuVi chart error:', error);
        return NextResponse.json({ error: 'Không thể lập lá số tử vi' }, { status: 500 });
    }
}
