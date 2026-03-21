/**
 * Script để set admin role cho user
 * Chạy: node scripts/set-admin.js <email>
 * VD: node scripts/set-admin.js admin@example.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdmin(email) {
    if (!email) {
        console.error('❌ Vui lòng cung cấp email');
        console.log('Sử dụng: node scripts/set-admin.js <email>');
        process.exit(1);
    }

    try {
        // Tìm user theo email
        const profile = await prisma.profile.findUnique({
            where: { email },
            select: { id: true, email: true, role: true, full_name: true }
        });

        if (!profile) {
            console.error(`❌ Không tìm thấy user với email: ${email}`);
            process.exit(1);
        }

        if (profile.role === 'admin') {
            console.log(`✅ User ${email} đã là admin rồi`);
            process.exit(0);
        }

        // Cập nhật role thành admin
        const updatedProfile = await prisma.profile.update({
            where: { email },
            data: { role: 'admin' }
        });

        console.log('✅ Cập nhật thành công!');
        console.log(`📧 Email: ${updatedProfile.email}`);
        console.log(`👤 Tên: ${updatedProfile.full_name || 'Chưa có'}`);
        console.log(`🔐 Role: ${updatedProfile.role}`);
        console.log(`🆔 ID: ${updatedProfile.id}`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Lấy email từ command line arguments
const email = process.argv[2];
setAdmin(email);