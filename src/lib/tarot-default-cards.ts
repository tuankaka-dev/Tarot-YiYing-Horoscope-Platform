export type TarotDefaultCard = {
    id: number;
    name: string;
    name_vi: string;
    meaning: string;
    image_url: string | null;
    card_type: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    keywords: string;
};

const TAROT_IMAGE_BASE_URL = 'https://pfdhweyxmvbytokajslj.supabase.co/storage/v1/object/public/78_TAROT';

const MAJOR_ARCANA: Array<Pick<TarotDefaultCard, 'id' | 'name' | 'name_vi' | 'meaning' | 'keywords'>> = [
    {
        id: 1,
        name: 'The Fool',
        name_vi: 'Kẻ Khờ',
        meaning:
            'Ý nghĩa xuôi: Khởi đầu mới, tự do, ngây thơ, tinh thần phiêu lưu, tiềm năng vô hạn.\n\nÝ nghĩa ngược: Thiếu suy nghĩ, liều lĩnh, thiếu chuẩn bị, lo lắng về bước đầu tiên.',
        keywords: 'Khởi đầu mới, tự do, phiêu lưu',
    },
    {
        id: 2,
        name: 'The Magician',
        name_vi: 'Nhà Ảo Thuật',
        meaning:
            'Ý nghĩa xuôi: Sự sáng tạo, khởi đầu, tài năng, kỹ năng, quyền lực cá nhân.\n\nÝ nghĩa ngược: Thao túng, lừa dối, tài năng chưa được phát huy, thiếu tập trung.',
        keywords: 'Sáng tạo, kỹ năng, quyền lực cá nhân',
    },
    {
        id: 3,
        name: 'The High Priestess',
        name_vi: 'Nữ Giáo Sĩ',
        meaning:
            'Ý nghĩa xuôi: Trực giác, tiềm thức, trí tuệ nội tại, bí ẩn, kiến thức sâu sắc.\n\nÝ nghĩa ngược: Bí mật bị tiết lộ, bỏ qua trực giác, thiếu hiểu biết nội tâm.',
        keywords: 'Trực giác, trí tuệ nội tại, bí ẩn',
    },
    {
        id: 4,
        name: 'The Empress',
        name_vi: 'Nữ Hoàng',
        meaning:
            'Ý nghĩa xuôi: Sự sinh sản, phong phú, tình mẫu tử, thiên nhiên, sự nuôi dưỡng.\n\nÝ nghĩa ngược: Phụ thuộc quá mức, thiếu sự nuôi dưỡng, sáng tạo bị chặn.',
        keywords: 'Nuôi dưỡng, phong phú, sáng tạo',
    },
    {
        id: 5,
        name: 'The Emperor',
        name_vi: 'Hoàng Đế',
        meaning:
            'Ý nghĩa xuôi: Quyền lực, uy quyền, cấu trúc, trật tự, kỷ luật, sự bảo vệ.\n\nÝ nghĩa ngược: Độc đoán, kiểm soát quá mức, thiếu linh hoạt, sự phản kháng.',
        keywords: 'Quyền lực, kỷ luật, cấu trúc',
    },
    {
        id: 6,
        name: 'The Hierophant',
        name_vi: 'Giáo Hoàng',
        meaning:
            'Ý nghĩa xuôi: Truyền thống, tôn giáo, tuân thủ, đạo đức, tinh thần, giáo dục.\n\nÝ nghĩa ngược: Thách thức quy ước, không tuân thủ, tự do tư tưởng.',
        keywords: 'Truyền thống, tinh thần, giáo dục',
    },
    { id: 7, name: 'The Lovers', name_vi: 'Tình Yêu', meaning: 'Kết nối sâu sắc, lựa chọn quan trọng về tình cảm và giá trị sống. Khi ngược chiều, lá bài nhắc về mâu thuẫn nội tâm hoặc thiếu đồng thuận.', keywords: 'Kết nối, lựa chọn, hòa hợp' },
    { id: 8, name: 'The Chariot', name_vi: 'Cỗ Xe', meaning: 'Tiến lên bằng ý chí, kiểm soát hướng đi và vượt qua trở ngại. Khi ngược chiều, biểu hiện mất định hướng hoặc thiếu kỷ luật.', keywords: 'Ý chí, tiến lên, kiểm soát' },
    { id: 9, name: 'Strength', name_vi: 'Sức Mạnh', meaning: 'Sức mạnh nội tâm, lòng kiên nhẫn và sự bao dung. Khi ngược chiều, có thể là nóng nảy, mất tự tin hoặc quá sức chịu đựng.', keywords: 'Nội lực, kiên nhẫn, tự chủ' },
    { id: 10, name: 'The Hermit', name_vi: 'Ẩn Sĩ', meaning: 'Tạm lùi để chiêm nghiệm, tìm chân lý bên trong. Khi ngược chiều, cảnh báo cô lập hoặc né tránh sự thật.', keywords: 'Chiêm nghiệm, trí tuệ, tĩnh lặng' },
    { id: 11, name: 'Wheel of Fortune', name_vi: 'Bánh Xe Số Mệnh', meaning: 'Chu kỳ thay đổi, thời vận chuyển động và bài học nhân quả. Khi ngược chiều, là cảm giác mắc kẹt hoặc biến động khó kiểm soát.', keywords: 'Chu kỳ, biến chuyển, thời vận' },
    { id: 12, name: 'Justice', name_vi: 'Công Lý', meaning: 'Sự công bằng, trách nhiệm và quyết định dựa trên sự thật. Khi ngược chiều, có thể là thiên vị, thiếu minh bạch hoặc hệ quả chưa được nhìn nhận.', keywords: 'Công bằng, trách nhiệm, sự thật' },
    { id: 13, name: 'The Hanged Man', name_vi: 'Người Treo Ngược', meaning: 'Góc nhìn mới, chấp nhận tạm dừng để hiểu sâu hơn. Khi ngược chiều, là trì trệ kéo dài hoặc chống lại thay đổi cần thiết.', keywords: 'Buông bỏ, góc nhìn mới, tạm dừng' },
    { id: 14, name: 'Death', name_vi: 'Cái Chết', meaning: 'Kết thúc một giai đoạn để tái sinh điều mới. Khi ngược chiều, báo hiệu níu kéo quá khứ và sợ thay đổi.', keywords: 'Kết thúc, tái sinh, chuyển hóa' },
    { id: 15, name: 'Temperance', name_vi: 'Tiết Chế', meaning: 'Cân bằng, điều độ và phối hợp hài hòa giữa các yếu tố. Khi ngược chiều, là cực đoan hoặc mất nhịp sống.', keywords: 'Cân bằng, điều độ, hài hòa' },
    { id: 16, name: 'The Devil', name_vi: 'Con Quỷ', meaning: 'Ràng buộc, cám dỗ, phụ thuộc hoặc nỗi sợ vô hình. Khi ngược chiều, là dấu hiệu giải phóng và lấy lại quyền làm chủ.', keywords: 'Ràng buộc, cám dỗ, giải phóng' },
    { id: 17, name: 'The Tower', name_vi: 'Tòa Tháp', meaning: 'Biến cố bất ngờ phá vỡ nền cũ để tái cấu trúc thật hơn. Khi ngược chiều, cảnh báo khủng hoảng âm ỉ hoặc trì hoãn điều tất yếu.', keywords: 'Biến cố, thức tỉnh, tái cấu trúc' },
    { id: 18, name: 'The Star', name_vi: 'Ngôi Sao', meaning: 'Hy vọng, chữa lành và niềm tin vào tương lai. Khi ngược chiều, là mất niềm tin tạm thời hoặc cảm giác mơ hồ.', keywords: 'Hy vọng, chữa lành, định hướng' },
    { id: 19, name: 'The Moon', name_vi: 'Mặt Trăng', meaning: 'Trực giác mạnh, cảm xúc sâu nhưng dễ nhiễu bởi ảo ảnh. Khi ngược chiều, là lộ rõ sự thật hoặc giảm bớt hoang mang.', keywords: 'Trực giác, ảo ảnh, cảm xúc' },
    { id: 20, name: 'The Sun', name_vi: 'Mặt Trời', meaning: 'Niềm vui, rõ ràng, sinh lực và kết quả tích cực. Khi ngược chiều, là thành tựu chậm lại hoặc niềm vui chưa trọn vẹn.', keywords: 'Rõ ràng, tích cực, thành tựu' },
    { id: 21, name: 'Judgement', name_vi: 'Phán Xét', meaning: 'Thức tỉnh, tự đánh giá và bước sang giai đoạn mới. Khi ngược chiều, là tự nghi ngờ hoặc chưa sẵn sàng đáp lời gọi thay đổi.', keywords: 'Thức tỉnh, tái sinh, tự đánh giá' },
    { id: 22, name: 'The World', name_vi: 'Thế Giới', meaning: 'Hoàn tất chu kỳ, hội nhập và cảm giác trọn vẹn. Khi ngược chiều, là dang dở hoặc cần hoàn thiện bước cuối cùng.', keywords: 'Hoàn tất, trọn vẹn, hội nhập' },
];

const MINOR_SUIT_BASE = {
    Cups: {
        nameVi: 'Cốc',
        focus: 'cảm xúc và mối quan hệ',
        upright: 'nuôi dưỡng cảm xúc, kết nối chân thành, trực giác mở rộng',
        reversed: 'cảm xúc rối, thiếu kết nối hoặc kỳ vọng lệch',
        keywords: 'Cảm xúc, quan hệ, trực giác',
    },
    Pentacles: {
        nameVi: 'Tiền',
        focus: 'vật chất và sự ổn định',
        upright: 'thực tế, xây nền tảng bền vững, chú ý nguồn lực',
        reversed: 'mất cân bằng tài chính, trì trệ hoặc thiếu kế hoạch',
        keywords: 'Tài chính, ổn định, thực tế',
    },
    Swords: {
        nameVi: 'Kiếm',
        focus: 'trí tuệ và thử thách',
        upright: 'tư duy sắc bén, sự thật rõ ràng, quyết định dứt khoát',
        reversed: 'xung đột nội tâm, căng thẳng, suy nghĩ quá tải',
        keywords: 'Tư duy, sự thật, thử thách',
    },
    Wands: {
        nameVi: 'Gậy',
        focus: 'năng lượng và đam mê',
        upright: 'chủ động hành động, sáng tạo, tiến lên với nhiệt huyết',
        reversed: 'mất lửa, nóng vội hoặc thiếu định hướng năng lượng',
        keywords: 'Năng lượng, hành động, đam mê',
    },
} as const;

const RANKS = [
    { name: 'Ace', nameVi: 'Át', number: 1 },
    { name: 'Two', nameVi: 'Hai', number: 2 },
    { name: 'Three', nameVi: 'Ba', number: 3 },
    { name: 'Four', nameVi: 'Bốn', number: 4 },
    { name: 'Five', nameVi: 'Năm', number: 5 },
    { name: 'Six', nameVi: 'Sáu', number: 6 },
    { name: 'Seven', nameVi: 'Bảy', number: 7 },
    { name: 'Eight', nameVi: 'Tám', number: 8 },
    { name: 'Nine', nameVi: 'Chín', number: 9 },
    { name: 'Ten', nameVi: 'Mười', number: 10 },
    { name: 'Page', nameVi: 'Tiểu Đồng', number: 11 },
    { name: 'Knight', nameVi: 'Kỵ Sĩ', number: 12 },
    { name: 'Queen', nameVi: 'Nữ Hoàng', number: 13 },
    { name: 'King', nameVi: 'Nhà Vua', number: 14 },
] as const;

function buildTarotImageUrl(card: Pick<TarotDefaultCard, 'card_type' | 'name' | 'number'>): string {
    if (card.card_type === 'major') {
        return `${TAROT_IMAGE_BASE_URL}/${card.number ?? 0}.png`;
    }

    const fileName = `${card.name.replace(/\s+/g, '-')}-icon.png`;
    return `${TAROT_IMAGE_BASE_URL}/${fileName}`;
}

export function buildDefaultTarotCards(): TarotDefaultCard[] {
    const cards: TarotDefaultCard[] = MAJOR_ARCANA.map((card) => {
        const majorCard: TarotDefaultCard = {
            ...card,
            image_url: null,
            card_type: 'major',
            suit: null,
            number: card.id - 1,
        };

        return {
            ...majorCard,
            image_url: buildTarotImageUrl(majorCard),
        };
    });

    let idCounter = 23;

    (Object.keys(MINOR_SUIT_BASE) as Array<keyof typeof MINOR_SUIT_BASE>).forEach((suitKey) => {
        const base = MINOR_SUIT_BASE[suitKey];

        RANKS.forEach((rank) => {
            const minorCard: TarotDefaultCard = {
                id: idCounter,
                name: `${rank.name} of ${suitKey}`,
                name_vi: `${rank.nameVi} ${base.nameVi}`,
                meaning: `Ý nghĩa xuôi: Lá bài phản ánh ${base.focus}, nhấn mạnh ${base.upright}.\n\nÝ nghĩa ngược: Lá bài cảnh báo ${base.reversed}.`,
                image_url: null,
                card_type: 'minor',
                suit: suitKey,
                number: rank.number,
                keywords: base.keywords,
            };

            cards.push({
                ...minorCard,
                image_url: buildTarotImageUrl(minorCard),
            });
            idCounter += 1;
        });
    });

    return cards;
}
