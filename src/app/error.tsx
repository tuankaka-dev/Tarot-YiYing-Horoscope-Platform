'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled App Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive opacity-80" />
            <h2 className="text-2xl font-semibold tracking-tight">Đã xảy ra lỗi</h2>
            <p className="text-muted-foreground max-w-md">
                Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề tiếp diễn.
            </p>
            <Button onClick={() => reset()} variant="default">
                Thử lại
            </Button>
        </div>
    );
}
