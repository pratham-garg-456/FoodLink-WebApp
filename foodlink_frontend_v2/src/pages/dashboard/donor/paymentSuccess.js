// File: /pages/dashboard/donor/paymentSuccess.js

import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (!session_id) {
      // If no session_id, maybe redirect back to home
    }
  }, [session_id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Thank you for your support!!!</h1>
      <button
        onClick={() => router.push('/dashboard/donor')}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Home
      </button>
    </div>
  );
}
