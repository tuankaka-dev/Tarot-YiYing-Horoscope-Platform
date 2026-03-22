'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Users, Ban, CheckCircle, Loader2, Coins, Crown, Pencil, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface UserItem {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_banned: boolean;
    created_at: string;
    credits: number;
    is_premium: boolean;
    is_pro: boolean;
    premium_until: string | null;
    _count: { histories: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [creditDialogUser, setCreditDialogUser] = useState<UserItem | null>(null);
    const [creditAmount, setCreditAmount] = useState('');
    const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);

    // Package management dialog
    const [packageDialogUser, setPackageDialogUser] = useState<UserItem | null>(null);
    const [selectedTier, setSelectedTier] = useState<'free' | 'premium' | 'pro'>('free');
    const [packageExpiry, setPackageExpiry] = useState('');
    const [isUpdatingPackage, setIsUpdatingPackage] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (userId: string, data: { role?: string; is_banned?: boolean }) => {
        setUpdatingId(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...data }),
            });

            if (res.ok) {
                const updated = await res.json();
                setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
                );
                toast.success('Đã cập nhật người dùng');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Cập nhật thất bại');
            }
        } catch {
            toast.error('Đã xảy ra lỗi');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateCredits = async () => {
        if (!creditDialogUser || !creditAmount) return;
        setIsUpdatingCredits(true);
        try {
            const res = await fetch(`/api/admin/users/${creditDialogUser.id}/credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(creditAmount) })
            });
            if (res.ok) {
                const updated = await res.json();
                setUsers(prev => prev.map(u => u.id === creditDialogUser.id ? { ...u, credits: updated.credits } : u));
                toast.success('Đã cập nhật số dư');
                setCreditDialogUser(null);
                setCreditAmount('');
            } else {
                toast.error('Cập nhật thất bại');
            }
        } catch {
            toast.error('Lỗi khi cập nhật số dư');
        } finally {
            setIsUpdatingCredits(false);
        }
    };

    const openPackageDialog = (user: UserItem) => {
        setPackageDialogUser(user);
        if (user.is_pro) {
            setSelectedTier('pro');
        } else if (user.is_premium) {
            setSelectedTier('premium');
        } else {
            setSelectedTier('free');
        }
        setPackageExpiry(user.premium_until ? new Date(user.premium_until).toISOString().slice(0, 10) : '');
    };

    const handleUpdatePackage = async () => {
        if (!packageDialogUser) return;
        setIsUpdatingPackage(true);
        try {
            const data: {
                userId: string;
                is_premium: boolean;
                is_pro: boolean;
                premium_until: string | null;
            } = {
                userId: packageDialogUser.id,
                is_premium: selectedTier === 'premium',
                is_pro: selectedTier === 'pro',
                premium_until: selectedTier !== 'free' && packageExpiry ? packageExpiry : null,
            };

            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const updated = await res.json();
                setUsers(prev =>
                    prev.map(u => u.id === packageDialogUser.id ? { ...u, ...updated } : u)
                );
                toast.success('Đã cập nhật gói đăng ký');
                setPackageDialogUser(null);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Cập nhật thất bại');
            }
        } catch {
            toast.error('Lỗi khi cập nhật gói');
        } finally {
            setIsUpdatingPackage(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            (user.full_name && user.full_name.toLowerCase().includes(query)) ||
            user.email.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    Quản Lý Người Dùng
                </h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý vai trò và quyền truy cập người dùng
                </p>
            </div>

            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg">Tất Cả Người Dùng ({users.length})</CardTitle>
                    <div className="relative w-full sm:w-64">
                        <svg
                          className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm kiếm email, tên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 pl-9 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead>Người dùng</TableHead>
                                    <TableHead>Vai trò</TableHead>
                                    <TableHead>Số dư xu</TableHead>
                                    <TableHead>Gói Đăng Ký</TableHead>
                                    <TableHead className="hidden md:table-cell">Số lần gieo</TableHead>
                                    <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
                                    <TableHead className="hidden lg:table-cell">Ngày tham gia</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="border-border/30">
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{user.full_name || '—'}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                onValueChange={(role: string | null) => { if (role) updateUser(user.id, { role }); }}
                                                disabled={updatingId === user.id || undefined}
                                            >
                                                <SelectTrigger className="w-32 h-8 bg-background/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">Người dùng</SelectItem>
                                                    <SelectItem value="admin">Quản trị</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-mystic-gold">{user.credits}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="w-6 h-6 hover:bg-mystic-gold/10 hover:text-mystic-gold"
                                                    onClick={() => setCreditDialogUser(user)}
                                                    title="Tặng/Trừ Xu"
                                                >
                                                    <Coins className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_pro ? (
                                                <div className="flex items-center gap-1.5 min-w-max">
                                                    <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 shadow-none px-2 py-0.5 font-bold">
                                                        <Zap className="w-3 h-3 mr-1" />
                                                        PRO
                                                    </Badge>
                                                    {user.premium_until && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            đến {new Date(user.premium_until).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-5 h-5 hover:bg-amber-500/10 hover:text-amber-500"
                                                        onClick={() => openPackageDialog(user)}
                                                        title="Chỉnh sửa gói"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : user.is_premium ? (
                                                <div className="flex items-center gap-1.5 min-w-max">
                                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 shadow-none px-2 py-0.5">
                                                        Premium
                                                    </Badge>
                                                    {user.premium_until && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            đến {new Date(user.premium_until).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-5 h-5 hover:bg-amber-500/10 hover:text-amber-500"
                                                        onClick={() => openPackageDialog(user)}
                                                        title="Chỉnh sửa gói"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className="text-muted-foreground border-border/50 bg-background/50 font-normal">
                                                        Cơ bản
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-5 h-5 hover:bg-amber-500/10 hover:text-amber-500"
                                                        onClick={() => openPackageDialog(user)}
                                                        title="Chỉnh sửa gói"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-mystic-gold">{user._count.histories}</span>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {user.is_banned ? (
                                                <Badge variant="destructive" className="gap-1">
                                                    <Ban className="w-3 h-3" />
                                                    Đã khoá
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1 border-green-500/30 text-green-400">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Hoạt động
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    updateUser(user.id, { is_banned: !user.is_banned })
                                                }
                                                disabled={updatingId === user.id}
                                                className={
                                                    user.is_banned
                                                        ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                                                        : 'text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                                                }
                                            >
                                                {updatingId === user.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : user.is_banned ? (
                                                    'Mở khoá'
                                                ) : (
                                                    'Khoá'
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!creditDialogUser} onOpenChange={(open) => !open && setCreditDialogUser(null)}>
                <DialogContent className="sm:max-w-md bg-card border-mystic-gold/20">
                    <DialogHeader>
                        <DialogTitle>Tặng/Trừ Xu</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Đang điều chỉnh cho: <span className="font-medium text-foreground">{creditDialogUser?.full_name || creditDialogUser?.email}</span>
                        </p>
                        <Input 
                            type="number" 
                            placeholder="Số xu (+ để cộng, - để trừ)" 
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            className="bg-background/50 border-mystic-gold/30 focus-visible:ring-mystic-gold/50"
                        />
                        <p className="text-xs text-muted-foreground">Ví dụ: Nhập `100` để cộng 100 xu, `-50` để trừ 50 xu.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreditDialogUser(null)} disabled={isUpdatingCredits}>Hủy</Button>
                        <Button 
                            onClick={handleUpdateCredits} 
                            disabled={!creditAmount || isUpdatingCredits}
                            className="bg-mystic-gold text-black hover:bg-amber-500"
                        >
                            {isUpdatingCredits ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Package Management Dialog */}
            <Dialog open={!!packageDialogUser} onOpenChange={(open) => !open && setPackageDialogUser(null)}>
                <DialogContent className="sm:max-w-md bg-card border-mystic-gold/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-mystic-gold" />
                            Quản Lý Gói Đăng Ký
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Đang điều chỉnh cho: <span className="font-medium text-foreground">{packageDialogUser?.full_name || packageDialogUser?.email}</span>
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chọn gói</label>
                            <Select
                                value={selectedTier}
                                onValueChange={(v) => setSelectedTier(v as 'free' | 'premium' | 'pro')}
                            >
                                <SelectTrigger className="bg-background/50 border-mystic-gold/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">🆓 Miễn Phí (Free)</SelectItem>
                                    <SelectItem value="premium">👑 Premium (Tuần)</SelectItem>
                                    <SelectItem value="pro">⚡ PRO (Tháng - Không giới hạn)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTier !== 'free' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ngày hết hạn</label>
                                <Input
                                    type="date"
                                    value={packageExpiry}
                                    onChange={(e) => setPackageExpiry(e.target.value)}
                                    className="bg-background/50 border-mystic-gold/30 focus-visible:ring-mystic-gold/50"
                                    min={new Date().toISOString().slice(0, 10)}
                                />
                                <p className="text-xs text-muted-foreground">Để trống nếu không giới hạn thời gian.</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPackageDialogUser(null)} disabled={isUpdatingPackage}>Hủy</Button>
                        <Button
                            onClick={handleUpdatePackage}
                            disabled={isUpdatingPackage}
                            className="bg-mystic-gold text-black hover:bg-amber-500"
                        >
                            {isUpdatingPackage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu Thay Đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
