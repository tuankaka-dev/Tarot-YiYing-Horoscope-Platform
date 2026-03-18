'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { Users, BookOpen, Settings, Activity } from 'lucide-react';

export default function AdminOverviewPage() {
    const { profile } = useAuthStore();
    const [stats, setStats] = useState({ users: 0, readings: 0, activeApi: '' });

    useEffect(() => {
        async function fetchStats() {
            try {
                const [usersRes, configRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/api-config'),
                ]);

                if (usersRes.ok) {
                    const users = await usersRes.json();
                    const totalReadings = users.reduce(
                        (acc: number, u: { _count: { histories: number } }) => acc + u._count.histories,
                        0
                    );
                    setStats((prev) => ({ ...prev, users: users.length, readings: totalReadings }));
                }

                if (configRes.ok) {
                    const configs = await configRes.json();
                    const active = configs.find((c: { status: string; name: string }) => c.status === 'active');
                    setStats((prev) => ({ ...prev, activeApi: active?.name || 'Chưa có' }));
                }
            } catch (error) {
                console.error('Lỗi khi tải thống kê:', error);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Tổng Người Dùng',
            value: stats.users,
            icon: Users,
            color: 'text-mystic-purple',
            bgColor: 'bg-mystic-purple/10',
        },
        {
            title: 'Tổng Lần Gieo Quẻ',
            value: stats.readings,
            icon: BookOpen,
            color: 'text-mystic-gold',
            bgColor: 'bg-mystic-gold/10',
        },
        {
            title: 'AI Đang Hoạt Động',
            value: stats.activeApi || 'Chưa có',
            icon: Settings,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <Activity className="w-8 h-8" />
                    Bảng Điều Khiển
                </h1>
                <p className="text-muted-foreground mt-1">
                    Chào mừng trở lại, {profile?.full_name || profile?.email || 'Quản trị viên'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="bg-card/30 backdrop-blur border-mystic-purple/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
