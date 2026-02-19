import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string().email().max(254),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(10)
      })
    )
    .min(1)
    .max(25)
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
