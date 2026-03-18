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
import { Users, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserItem {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_banned: boolean;
    created_at: string;
    _count: { histories: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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
                                    <TableHead>Số lần gieo</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tham gia</TableHead>
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
                                            <span className="text-mystic-gold">{user._count.histories}</span>
                                        </TableCell>
                                        <TableCell>
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
                                        <TableCell className="text-xs text-muted-foreground">
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
        </div>
    );
}
