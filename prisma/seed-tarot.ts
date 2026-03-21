import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const majorArcana = [
    { number: 0, name: 'The Fool', name_vi: 'Kẻ Ngốc', keywords: 'khởi đầu, ngây thơ, phiêu lưu, tự do', meaning: 'Khởi đầu mới, sự ngây thơ, phiêu lưu không sợ hãi, tiềm năng vô hạn' },
    { number: 1, name: 'The Magician', name_vi: 'Nhà Ảo Thuật', keywords: 'sức mạnh, kỹ năng, tập trung, hành động', meaning: 'Sức mạnh biểu hiện, kỹ năng, nguồn lực, hành động quyết đoán' },
    { number: 2, name: 'The High Priestess', name_vi: 'Nữ Tư Tế', keywords: 'trực giác, bí ẩn, tiềm thức, tri thức', meaning: 'Trực giác, bí ẩn, tri thức tiềm thức, sự tĩnh lặng' },
    { number: 3, name: 'The Empress', name_vi: 'Nữ Hoàng', keywords: 'sinh sản, nuôi dưỡng, phong phú, tự nhiên', meaning: 'Sự sinh sản, nuôi dưỡng, phong phú, vẻ đẹp tự nhiên' },
    { number: 4, name: 'The Emperor', name_vi: 'Hoàng Đế', keywords: 'quyền lực, cấu trúc, kiểm soát, ổn định', meaning: 'Quyền lực, cấu trúc, kiểm soát, sự ổn định và trật tự' },
    { number: 5, name: 'The Hierophant', name_vi: 'Giáo Hoàng', keywords: 'truyền thống, tâm linh, giáo dục, đức tin', meaning: 'Truyền thống, giáo dục tâm linh, đức tin, tuân thủ' },
    { number: 6, name: 'The Lovers', name_vi: 'Người Yêu', keywords: 'tình yêu, lựa chọn, hòa hợp, quan hệ', meaning: 'Tình yêu, sự lựa chọn, hòa hợp, mối quan hệ' },
    { number: 7, name: 'The Chariot', name_vi: 'Cỗ Xe', keywords: 'ý chí, quyết tâm, chiến thắng, kiểm soát', meaning: 'Ý chí mạnh mẽ, quyết tâm, chiến thắng, tự kiểm soát' },
    { number: 8, name: 'Strength', name_vi: 'Sức Mạnh', keywords: 'can đảm, kiên nhẫn, lòng từ bi, tự tin', meaning: 'Can đảm, kiên nhẫn, lòng từ bi, sức mạnh nội tại' },
    { number: 9, name: 'The Hermit', name_vi: 'Ẩn Sĩ', keywords: 'nội tâm, tìm kiếm, cô đơn, trí tuệ', meaning: 'Tìm kiếm nội tâm, cô đơn, trí tuệ, sự hướng dẫn' },
    { number: 10, name: 'Wheel of Fortune', name_vi: 'Bánh Xe Vận Mệnh', keywords: 'vận mệnh, thay đổi, chu kỳ, cơ hội', meaning: 'Vận mệnh, thay đổi, chu kỳ cuộc sống, cơ hội' },
    { number: 11, name: 'Justice', name_vi: 'Công Lý', keywords: 'công bằng, chân lý, luật pháp, trách nhiệm', meaning: 'Công bằng, chân lý, luật pháp, trách nhiệm' },
    { number: 12, name: 'The Hanged Man', name_vi: 'Người Treo Ngược', keywords: 'hy sinh, buông bỏ, góc nhìn mới, chờ đợi', meaning: 'Hy sinh, buông bỏ, góc nhìn mới, sự chờ đợi' },
    { number: 13, name: 'Death', name_vi: 'Cái Chết', keywords: 'kết thúc, chuyển hóa, tái sinh, thay đổi', meaning: 'Kết thúc, chuyển hóa, tái sinh, thay đổi lớn' },
    { number: 14, name: 'Temperance', name_vi: 'Tiết Độ', keywords: 'cân bằng, hòa hợp, kiên nhẫn, điều độ', meaning: 'Cân bằng, hòa hợp, kiên nhẫn, sự điều độ' },
    { number: 15, name: 'The Devil', name_vi: 'Ác Quỷ', keywords: 'ràng buộc, cám dỗ, vật chất, nghiện ngập', meaning: 'Ràng buộc, cám dỗ, vật chất, nghiện ngập' },
    { number: 16, name: 'The Tower', name_vi: 'Tòa Tháp', keywords: 'phá hủy, thay đổi đột ngột, giải phóng, khủng hoảng', meaning: 'Phá hủy, thay đổi đột ngột, giải phóng, khủng hoảng' },
    { number: 17, name: 'The Star', name_vi: 'Ngôi Sao', keywords: 'hy vọng, cảm hứng, bình yên, chữa lành', meaning: 'Hy vọng, cảm hứng, bình yên, sự chữa lành' },
    { number: 18, name: 'The Moon', name_vi: 'Mặt Trăng', keywords: 'ảo tưởng, sợ hãi, tiềm thức, trực giác', meaning: 'Ảo tưởng, sợ hãi, tiềm thức, trực giác' },
    { number: 19, name: 'The Sun', name_vi: 'Mặt Trời', keywords: 'vui vẻ, thành công, sức sống, rõ ràng', meaning: 'Vui vẻ, thành công, sức sống, sự rõ ràng' },
    { number: 20, name: 'Judgement', name_vi: 'Phán Xét', keywords: 'phán xét, tái sinh, tha thứ, kêu gọi', meaning: 'Phán xét, tái sinh, tha thứ, lời kêu gọi cao cả' },
    { number: 21, name: 'The World', name_vi: 'Thế Giới', keywords: 'hoàn thành, thành tựu, hòa nhập, chu kỳ', meaning: 'Hoàn thành, thành tựu, hòa nhập, kết thúc chu kỳ' },
];

const minorArcana = [
    // Wands (Gậy) - Fire element
    ...Array.from({ length: 14 }, (_, i) => {
        const num = i + 1;
        const names = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
        const namesVi = ['Át', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Cận Vệ', 'Hiệp Sĩ', 'Nữ Hoàng', 'Vua'];
        return {
            number: num,
            name: `${names[i]} of Wands`,
            name_vi: `${namesVi[i]} Gậy`,
            suit: 'wands',
            keywords: 'năng lượng, hành động, sáng tạo, đam mê',
            meaning: `Năng lượng, hành động, sáng tạo, đam mê - ${names[i]} of Wands`,
        };
    }),
    // Cups (Chén) - Water element
    ...Array.from({ length: 14 }, (_, i) => {
        const num = i + 1;
        const names = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
        const namesVi = ['Át', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Cận Vệ', 'Hiệp Sĩ', 'Nữ Hoàng', 'Vua'];
        return {
            number: num,
            name: `${names[i]} of Cups`,
            name_vi: `${namesVi[i]} Chén`,
            suit: 'cups',
            keywords: 'cảm xúc, tình yêu, mối quan hệ, trực giác',
            meaning: `Cảm xúc, tình yêu, mối quan hệ, trực giác - ${names[i]} of Cups`,
        };
    }),
    // Swords (Kiếm) - Air element
    ...Array.from({ length: 14 }, (_, i) => {
        const num = i + 1;
        const names = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
        const namesVi = ['Át', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Cận Vệ', 'Hiệp Sĩ', 'Nữ Hoàng', 'Vua'];
        return {
            number: num,
            name: `${names[i]} of Swords`,
            name_vi: `${namesVi[i]} Kiếm`,
            suit: 'swords',
            keywords: 'tư duy, logic, xung đột, quyết định',
            meaning: `Tư duy, logic, xung đột, quyết định - ${names[i]} of Swords`,
        };
    }),
    // Pentacles (Xu) - Earth element
    ...Array.from({ length: 14 }, (_, i) => {
        const num = i + 1;
        const names = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
        const namesVi = ['Át', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Cận Vệ', 'Hiệp Sĩ', 'Nữ Hoàng', 'Vua'];
        return {
            number: num,
            name: `${names[i]} of Pentacles`,
            name_vi: `${namesVi[i]} Xu`,
            suit: 'pentacles',
            keywords: 'vật chất, tài chính, công việc, thực tế',
            meaning: `Vật chất, tài chính, công việc, thực tế - ${names[i]} of Pentacles`,
        };
    }),
];

async function main() {
    console.log('Seeding Tarot cards...');

    // Seed Major Arcana
    for (const card of majorArcana) {
        await prisma.tarotCard.upsert({
            where: { id: card.number + 1 }, // ID starts from 1
            update: {},
            create: {
                name: card.name,
                name_vi: card.name_vi,
                meaning: card.meaning,
                card_type: 'major',
                suit: null,
                number: card.number,
                keywords: card.keywords,
                image_url: null,
            },
        });
    }

    console.log('Seeded 22 Major Arcana cards');

    // Seed Minor Arcana
    let id = 23; // Start after Major Arcana
    for (const card of minorArcana) {
        await prisma.tarotCard.upsert({
            where: { id },
            update: {},
            create: {
                name: card.name,
                name_vi: card.name_vi,
                meaning: card.meaning,
                card_type: 'minor',
                suit: card.suit,
                number: card.number,
                keywords: card.keywords,
                image_url: null,
            },
        });
        id++;
    }

    console.log('Seeded 56 Minor Arcana cards');
    console.log('Total: 78 Tarot cards seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
