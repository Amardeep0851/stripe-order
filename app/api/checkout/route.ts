import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { checkoutSchema } from '@/lib/validators';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? 'unknown';
  const ip = forwardedFor.split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(ip)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');
  const productId = String(formData.get('productId') ?? '');
  const quantity = Number(formData.get('quantity') ?? 1);

  const parsed = checkoutSchema.safeParse({
    email,
    items: [{ productId, quantity }]
  });

  if (!parsed.success) {
    return new NextResponse('Invalid checkout payload', { status: 400 });
  }

  const [item] = parsed.data.items;
  const product = await prisma.product.findFirst({ where: { id: item.productId, active: true } });

  if (!product) {
    return new NextResponse('Product not found', { status: 404 });
  }

  const totalCents = product.priceCents * item.quantity;
  const order = await prisma.order.create({
    data: {
      email: parsed.data.email,
      totalCents,
      currency: product.currency,
      items: {
        create: {
          productId: product.id,
          quantity: item.quantity,
          unitCents: product.priceCents,
          subtotal: totalCents
        }
      }
    }
  });

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: parsed.data.email,
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
    line_items: [
      {
        quantity: item.quantity,
        price_data: {
          currency: product.currency,
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            description: product.description
          }
        }
      }
    ],
    metadata: {
      orderId: order.id
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSession: session.id }
  });

  if (!session.url) {
    return new NextResponse('Unable to initialize payment', { status: 500 });
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
