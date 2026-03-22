'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Settings, LayoutDashboard, BookOpen, CreditCard, Bell, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/admin', label: 'Tổng Quan', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
    { href: '/admin/hexagrams', label: 'Quản Lý Quẻ Dịch', icon: BookOpen },
    { href: '/admin/tarot', label: 'Quản Lý Tarot', icon: Sparkles },
    { href: '/admin/transactions', label: 'Giao Dịch', icon: CreditCard },
    { href: '/admin/history', label: 'Lịch Sử Gieo Quẻ', icon: History },
    { href: '/admin/notifications', label: 'Thông Báo', icon: Bell },
    { href: '/admin/api-config', label: 'Cấu Hình API', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border/50 bg-card/20 backdrop-blur p-4 space-y-2 hidden md:block">
                <div className="flex items-center gap-2 px-3 py-4 mb-4">
                    <Shield className="w-6 h-6 text-mystic-purple" />
                    <span className="font-bold text-lg text-mystic-purple">Quản Trị</span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-mystic-purple/20 text-mystic-purple border border-mystic-purple/30'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <div className="md:hidden sticky top-0 z-20 border-b border-border/50 bg-background/95 backdrop-blur px-3 py-2">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border',
                                        isActive
                                            ? 'bg-mystic-purple/20 text-mystic-purple border-mystic-purple/30'
                                            : 'text-muted-foreground border-border/60 hover:text-foreground hover:bg-accent'
                                    )}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 md:p-8">
                {children}
                </div>
            </div>
        </div>
    );
}
