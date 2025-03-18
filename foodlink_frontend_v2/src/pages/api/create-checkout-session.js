import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the amount from the request body (in cents)
    const { amount } = req.body;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Monetary Donation',
            },
            unit_amount: amount * 100, // convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/dashboard/donor/paymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
      // Redirect cancelled payments to donor dashboard
      cancel_url: `${req.headers.origin}/dashboard/donor`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
