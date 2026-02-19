import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new NextResponse('Webhook secret/signature missing', { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            stripeCheckoutSession: session.id,
            stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : null
          }
        });
      }
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
