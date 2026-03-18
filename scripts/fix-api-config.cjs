const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const result = await p.apiConfig.updateMany({
        where: { provider: 'gemini' },
        data: {
            api_key: process.env.GEMINI_API_KEY,
            name: 'Gemini 2.0 Flash',
            status: 'active',
        },
    });
    console.log('Updated:', result.count, 'config(s)');

    const configs = await p.apiConfig.findMany();
    for (const c of configs) {
        console.log(`  - ${c.name} | provider: ${c.provider} | status: ${c.status} | key: ${c.api_key.substring(0, 10)}...`);
    }
}

main().catch(console.error).finally(() => p['$disconnect']());
