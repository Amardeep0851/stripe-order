import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { id: 'seed-rick-shirt' },
    update: {},
    create: {
      id: 'seed-rick-shirt',
      name: 'RickCart Shirt',
      description: 'Premium cotton shirt',
      priceCents: 2999,
      currency: 'usd'
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
