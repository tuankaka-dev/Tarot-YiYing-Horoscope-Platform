import { TarotSession } from '@/components/organisms/TarotSession';

export default function TarotPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <TarotSession />
            </div>
        </div>
    );
}
