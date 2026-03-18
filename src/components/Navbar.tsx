'use client';

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
import { LogOut, User, History, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { user, profile, signOut, isLoading } = useAuthStore();
    const router = useRouter();

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
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        ) : user ? (
                            <>
                                <Link href="/divine">
                                    <Button
                                        variant="ghost"
                                        className="gap-2 text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Gieo Quẻ Kinh Dịch
                                    </Button>
                                </Link>
                                <Link href="/null">
                                    <Button
                                        variant="ghost"
                                        className="gap-2 text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Xem Tử Vi
                                    </Button>
                                </Link>
                                <Link href="/null">
                                    <Button
                                        variant="ghost"
                                        className="gap-2 text-mystic-gold hover:text-mystic-gold/80 hover:bg-mystic-gold/10"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Xem Tarot
                                    </Button>
                                </Link>


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
            </div>
        </nav>
    );
}
