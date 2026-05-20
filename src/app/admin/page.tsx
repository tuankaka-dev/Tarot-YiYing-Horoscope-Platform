'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { Users, BookOpen, Settings, Activity } from 'lucide-react';

export default function AdminOverviewPage() {
    const { profile } = useAuthStore();
    const [stats, setStats] = useState({
        users: 0,
        readings: 0,
        activeApi: '',
        totalRevenue: 0,
        totalSuccess: 0,
        totalPending: 0
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const [usersRes, configRes, txRes, historyRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/api-config'),
                    fetch('/api/admin/transactions'),
                    fetch('/api/admin/history?page=1&pageSize=1'),
                ]);

                if (usersRes.ok) {
                    const users = await usersRes.json();
                    setStats((prev) => ({ ...prev, users: users.length }));
                }

                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setStats((prev) => ({ ...prev, readings: historyData.pagination?.total || 0 }));
                }

                if (configRes.ok) {
                    const configs = await configRes.json();
                    const active = configs.find((c: { status: string; name: string }) => c.status === 'active');
                    setStats((prev) => ({ ...prev, activeApi: active?.name || 'Chưa có' }));
                }

                if (txRes.ok) {
                    const txData = await txRes.json();
                    setStats((prev) => ({
                        ...prev,
                        totalRevenue: txData.stats?.totalRevenue || 0,
                        totalSuccess: txData.stats?.totalSuccess || 0,
                        totalPending: txData.stats?.totalPending || 0,
                    }));
                }
            } catch (error) {
                console.error('Lỗi khi tải thống kê:', error);
            }
        }

        fetchStats();
    }, []);

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    }

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
            title: 'Doanh Thu',
            value: formatCurrency(stats.totalRevenue),
            icon: Activity,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-400/10',
        },
        {
            title: 'Đơn Thành Công',
            value: stats.totalSuccess,
            icon: Activity,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
        },
        {
            title: 'Đơn Đang Chờ',
            value: stats.totalPending,
            icon: Activity,
            color: 'text-amber-400',
            bgColor: 'bg-amber-400/10',
        },
        {
            title: 'AI Đang Hoạt Động',
            value: stats.activeApi || 'Chưa có',
            icon: Settings,
            color: 'text-slate-400',
            bgColor: 'bg-slate-400/10',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-mystic-purple mb-2">
                    Release 1.2.5 - Cập nhật ngày 25/3/2026
                </p>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <Activity className="w-8 h-8" />
                    Bảng Điều Khiển
                </h1>
                <p className="text-muted-foreground mt-1">
                    Chào mừng trở lại, {profile?.full_name || profile?.email || 'Quản trị viên'}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
