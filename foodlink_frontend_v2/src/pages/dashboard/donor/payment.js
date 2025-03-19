import { useRouter } from 'next/router';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import payment from '../../../../public/images/payment.jpg';

export default function PaymentProcess() {
  const router = useRouter();
  // For demonstration, default donation amount is 50
  const [amount, setAmount] = useState(50);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStripePayment = async () => {
    try {
      // Call our API route to create a Stripe Checkout Session
      const { data } = await axios.post('/api/create-checkout-session', {
        amount, // in dollars
      });

      const { sessionId } = data;
      if (!sessionId) {
        setErrorMessage('No session ID returned from Stripe');
        return;
      }

      // Dynamically import Stripe.js
      const stripe = await import('@stripe/stripe-js').then((m) =>
        m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      );
      if (!stripe) {
        setErrorMessage('Stripe could not be loaded.');
        return;
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      setErrorMessage('Failed to start payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-gray-50 p-6 rounded shadow">
        {/* Left Section: Payment Info */}
        <div className="w-full md:w-1/2 pr-0 md:pr-4">
          <h1 className="text-2xl font-bold mb-4">Payment Process</h1>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          {/* Donation Amount Field */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Donation Amount ($)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          {/* "Pay with Stripe" Button */}
          <button
            onClick={handleStripePayment}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
          >
            Pay with Stripe
          </button>

          {/* Optional Cancel Button */}
          <button
            onClick={() => router.push('/dashboard/donor')}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 mt-4 ml-2"
          >
            Cancel
          </button>
        </div>

        {/* Right Section: Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
          <div className="w-64 h-64 bg-gray-300 flex items-center justify-center">
            <Image
              src={payment}
              alt="Payment"
              className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
