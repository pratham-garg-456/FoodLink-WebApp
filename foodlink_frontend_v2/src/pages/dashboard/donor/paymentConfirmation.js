import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PaymentConfirmation() {
  const router = useRouter();
  const { donationId } = router.query;
  const [donation, setDonation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!donationId) return;
    const fetchDonation = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations/${donationId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
        );
        setDonation(response.data.donation);
      } catch (error) {
        setErrorMessage('Failed to retrieve payment confirmation details.');
      }
    };
    fetchDonation();
  }, [donationId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Payment Confirmation</h1>
      {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
      {donation ? (
        <div className="border p-4 rounded">
          <p>
            <strong>Donation ID:</strong> {donation.id}
          </p>
          <p>
            <strong>Amount:</strong> ${donation.amount.toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {donation.status}
          </p>
          <p>
            <strong>Transaction ID:</strong> {donation.transaction_id || 'N/A'}
          </p>
          <p>
            <strong>Timestamp:</strong> {new Date(donation.created_at).toLocaleString()}
          </p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => router.push('/donor/DonationHistory')}
          >
            View Donation History
          </button>
        </div>
      ) : (
        <p className="text-center">Loading confirmation details...</p>
      )}
    </div>
  );
}
