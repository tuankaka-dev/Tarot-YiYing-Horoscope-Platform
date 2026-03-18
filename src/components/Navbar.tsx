'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, History, Shield, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { user, profile, signOut, isLoading } = useAuthStore();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-mystic-gold/10 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:animate-spin-slow transition-transform">☯</span>
                        <span className="font-bold text-lg text-mystic-gold text-gold-glow tracking-wide">
                            GieoQuẻ
                            <span className="text-foreground">.Online</span>

                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        ) : user ? (
                            <>
                                {/* Desktop Links: Hidden on Mobile */}
                                <div className="hidden md:flex items-center gap-2">
                                    <Link href="/divine">
                                        <Button
                                            variant="ghost"
                                            className="text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10"
                                        >
                                            Gieo Quẻ Kinh Dịch
                                        </Button>
                                    </Link>
                                    <Link href="/null">
                                        <Button
                                            variant="ghost"
                                            className="text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10"
                                        >
                                            Xem Tử Vi
                                        </Button>
                                    </Link>
                                    <Link href="/null">
                                        <Button
                                            variant="ghost"
                                            className="text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10"
                                        >
                                            Xem Tarot
                                        </Button>
                                    </Link>
                                </div>

                                {/* Avatar Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="relative h-9 w-9 rounded-full cursor-pointer focus:outline-none">
                                        <Avatar className="h-9 w-9 border border-mystic-gold/30">
                                            <AvatarFallback className="bg-mystic-gold/10 text-mystic-gold text-sm font-semibold">
                                                {(profile?.full_name || user.email || '?')[0].toUpperCase()}

                                            </AvatarFallback>
                                        </Avatar>

                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56 bg-white border-border shadow-lg"
                                    >
                                        <div className="px-2 py-1.5">
                                            <p className="text-sm font-medium">{profile?.full_name || 'Người dùng'}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => router.push('/dashboard/profile')}
                                        >
                                            <User className="w-4 h-4" />
                                            Hồ Sơ
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => router.push('/dashboard')}
                                        >
                                            <History className="w-4 h-4" />
                                            Lịch Sử Gieo Quẻ
                                        </DropdownMenuItem>
                                        {profile?.role === 'admin' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="gap-2 cursor-pointer text-mystic-gold"
                                                    onClick={() => router.push('/admin')}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    Quản Trị
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
                                            <LogOut className="w-4 h-4" />
                                            Đăng Xuất
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Mobile Hamburger Menu Toggle */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden text-mystic-gold hover:bg-mystic-gold/10"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/register">
                                    <Button className="bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-mystic-gold/90 hover:to-amber-600/90 text-white">
                                        Bắt Đầu
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Panel */}
                {isMobileMenuOpen && user && (
                    <div className="md:hidden py-4 border-t border-mystic-gold/10 flex flex-col gap-2 animate-in slide-in-from-top-4 fade-in-50 duration-200">
                        <Link href="/divine" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10 text-lg py-6"
                            >
                                Gieo Quẻ Kinh Dịch
                            </Button>
                        </Link>
                        <Link href="/null" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10 text-lg py-6"
                            >
                                Xem Tử Vi
                            </Button>
                        </Link>
                        <Link href="/null" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10 text-lg py-6"
                            >
                                Xem Tarot
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
