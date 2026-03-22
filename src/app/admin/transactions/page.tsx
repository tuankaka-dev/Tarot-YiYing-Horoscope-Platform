'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    ArrowUpRight,
} from 'lucide-react';

interface TransactionItem {
    id: string;
    user_id: string;
    amount_vnd: number;
    credits_change: number;
    status: string;
    type: string;
    payos_order_id: string | null;
    created_at: string;
    profile: {
        email: string;
        full_name: string | null;
    };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    success: { label: 'Thành công', variant: 'default', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' },
    pending: { label: 'Đang chờ', variant: 'secondary', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' },
    failed: { label: 'Thất bại', variant: 'destructive', className: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20' },
};

const typeLabels: Record<string, string> = {
    premium_weekly: 'Premium Tuần',
    pro_monthly: 'PRO Tháng',
    credit_purchase: 'Mua Xu',
    daily_reset: 'Reset Hàng Ngày',
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const res = await fetch('/api/admin/transactions');
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data.transactions);
                }
            } catch (error) {
                console.error('Lỗi khi tải giao dịch:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTransactions();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <CreditCard className="w-8 h-8" />
                    Quản Lý Giao Dịch
                </h1>
                <p className="text-muted-foreground mt-1">
                    Lịch sử toàn bộ các giao dịch trên hệ thống
                </p>
            </div>

            {/* Transaction History Table */}
            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-mystic-purple" />
                        Lịch Sử Giao Dịch Gần Đây
                    </CardTitle>
                    <Badge variant="outline" className="border-mystic-purple/30 text-mystic-purple">
                        {transactions.length} giao dịch
                    </Badge>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Chưa có giao dịch nào</p>
                            <p className="text-sm mt-1">Các giao dịch sẽ xuất hiện ở đây khi người dùng mua Premium</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Người dùng</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loại</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số tiền</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Xu</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => {
                                        const status = statusConfig[tx.status] || statusConfig.pending;
                                        return (
                                            <tr
                                                key={tx.id}
                                                className="border-b border-border/30 hover:bg-muted/5 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="text-sm font-medium truncate max-w-[200px]">
                                                            {tx.profile?.full_name || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {tx.profile?.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-foreground/80">
                                                        {typeLabels[tx.type] || tx.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-sm font-semibold text-emerald-400">
                                                        {tx.amount_vnd > 0 ? formatCurrency(tx.amount_vnd) : '—'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-sm font-medium text-mystic-gold">
                                                        {tx.credits_change > 0 ? `+${tx.credits_change}` : tx.credits_change || '—'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge variant={status.variant} className={status.className}>
                                                        {status.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(tx.created_at).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
