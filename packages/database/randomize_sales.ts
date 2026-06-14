import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { sales_count: Math.floor(Math.random() * 500) }
    });
  }
  console.log("Randomized sales count for " + products.length + " products");
}
main();
