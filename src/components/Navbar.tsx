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
import { LogOut, User, History, Shield, Menu, X, Coins, Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { user, profile, signOut, isLoading } = useAuthStore();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.refresh();
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
                            <span className="text-foreground">.App</span>

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

                                {/* Balance & Premium Status */}
                                <div className="hidden sm:flex items-center gap-2 mr-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mystic-gold/10 border border-mystic-gold/20">
                                        <Coins className="w-4 h-4 text-mystic-gold" />
                                        <span className="text-sm font-bold text-mystic-gold">{profile?.credits || 0}</span>
                                    </div>
                                </div>

                                {/* Avatar Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none ring-2 ring-transparent transition-all hover:ring-mystic-gold/50 rounded-full md:pl-1 md:pr-4 py-1">
                                        <Avatar className="h-9 w-9 border-2 border-mystic-gold/30">
                                            <AvatarFallback className="bg-mystic-gold/10 text-mystic-gold font-semibold">
                                                {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-sm font-medium text-foreground/80 max-w-[120px] truncate">
                                            {profile?.full_name || 'Người dùng'}
                                        </span>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        className="w-64 bg-white border-border shadow-lg"
                                    >
                                        <div className="px-3 py-2 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold truncate max-w-[130px]">{profile?.full_name || 'Người dùng'}</p>
                                                {(profile as any)?.is_pro ? (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-500 bg-amber-500/10 animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.3)]">
                                                        <Zap className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">PRO</span>
                                                    </div>
                                                ) : profile?.is_premium ? (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-500/10">
                                                        <Crown className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Premium</span>
                                                    </div>
                                                ) : (
                                                    <div className="px-1.5 py-0.5 rounded border border-muted-foreground/30 bg-muted-foreground/5">
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Free</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => router.push('/dashboard')}
                                        >
                                            <History className="w-4 h-4" />
                                            Cá nhân
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
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => router.push('/dashboard/profile')}
                                        >
                                            <User className="w-4 h-4" />
                                            Cài đặt
                                        </DropdownMenuItem>
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
