const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    const cats = await prisma.category.findMany();
    console.log("Categories:", cats.length);
  } catch(e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
