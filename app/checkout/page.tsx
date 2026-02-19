import { prisma } from '@/lib/prisma';

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: { productId?: string };
}) {
  const product = searchParams.productId
    ? await prisma.product.findUnique({ where: { id: searchParams.productId } })
    : null;

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="card">
      <h1>Checkout</h1>
      <p>{product.name}</p>
      <p>${(product.priceCents / 100).toFixed(2)}</p>

      <form method="POST" action="/api/checkout">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" />

        <label htmlFor="quantity">Quantity</label>
        <input id="quantity" name="quantity" type="number" defaultValue={1} min={1} max={10} required />

        <input type="hidden" name="productId" value={product.id} />
        <button type="submit">Pay with Stripe</button>
      </form>
    </div>
  );
}
