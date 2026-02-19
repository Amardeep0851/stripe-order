import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });

  return (
    <>
      <h1>RickCart Checkout</h1>
      <p>Secure checkout flow with Stripe, Prisma, and Postgres (rickcart).</p>
      {products.map((product) => (
        <article className="card" key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>
            <strong>${(product.priceCents / 100).toFixed(2)}</strong>
          </p>
          <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`}>Buy now</Link>
        </article>
      ))}
    </>
  );
}
