'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error Boundary caught error:', error);
    }, [error]);

    return (
        <html lang="vi">
            <body className="antialiased min-h-screen flex items-center justify-center p-8 text-center">
                <main className="space-y-6 max-w-sm mx-auto">
                    <h2 className="text-2xl font-semibold text-red-500">Lỗi Hệ Thống Nghiêm Trọng</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Đã xảy ra lỗi nghiêm trọng ngoài ý muốn. Vui lòng tải lại trang.
                    </p>
                    <Button onClick={() => reset()} variant="outline" className="w-full">
                        Tải Lại Trang
                    </Button>
                </main>
            </body>
        </html>
    );
}
