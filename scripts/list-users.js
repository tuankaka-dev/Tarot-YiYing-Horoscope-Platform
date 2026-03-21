/**
 * Script để xem danh sách users
 * Chạy: node scripts/list-users.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const profiles = await prisma.profile.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                full_name: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        if (profiles.length === 0) {
            console.log('📭 Chưa có user nào trong database');
            return;
        }

        console.log(`📊 Tổng cộng: ${profiles.length} users\n`);
        
        profiles.forEach((profile, index) => {
            const roleIcon = profile.role === 'admin' ? '👑' : '👤';
            const createdDate = new Date(profile.created_at).toLocaleDateString('vi-VN');
            
            console.log(`${index + 1}. ${roleIcon} ${profile.email}`);
            console.log(`   Tên: ${profile.full_name || 'Chưa có'}`);
            console.log(`   Role: ${profile.role}`);
            console.log(`   Tạo: ${createdDate}`);
            console.log(`   ID: ${profile.id}`);
            console.log('');
        });

        const adminCount = profiles.filter(p => p.role === 'admin').length;
        console.log(`👑 Admin: ${adminCount} | 👤 User: ${profiles.length - adminCount}`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();