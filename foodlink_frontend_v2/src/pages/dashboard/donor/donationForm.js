import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';

export default function DonationForm() {
  const router = useRouter();
  const [donorId, setDonorId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check token and set donor id
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const decodedToken = await validateToken(token);
        setDonorId(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    if (parseFloat(amount) <= 0) {
      setErrorMessage('Donation amount must be greater than zero');
      return;
    }

    try {
      const donationResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations`,
        {
          amount: parseFloat(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const donation = donationResponse.data.donation;

      const paymentIntentResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/create-fake-payment-intent`,
        { amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      const { transactionId } = paymentIntentResponse.data;

      const confirmResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations/${donation.id}/payment`,
        { transaction_id: transactionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setMessage(
        `Donation successful! Transaction ID: ${confirmResponse.data.donation.transaction_id}`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response && error.response.data && error.response.data.detail
          ? error.response.data.detail
          : 'An error occurred while processing your donation.'
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Donate to the Food Bank</h1>
      {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Donation Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
        >
          Donate Now!
        </button>
      </form>
    </div>
  );
}
