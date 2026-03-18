'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Settings, LayoutDashboard, BookOpen, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/admin', label: 'Tổng Quan', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
    { href: '/admin/hexagrams', label: 'Quản Lý Quẻ Dịch', icon: BookOpen },
    { href: '/admin/transactions', label: 'Giao Dịch', icon: CreditCard },
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
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
