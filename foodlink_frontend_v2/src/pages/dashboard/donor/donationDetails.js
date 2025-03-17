import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function DonationDetails() {
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
        setErrorMessage(error.response?.data?.detail || 'Failed to fetch donation details.');
      }
    };
    fetchDonation();
  }, [donationId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Donation Details</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
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
        </div>
      ) : (
        <p>Loading donation details...</p>
      )}
    </div>
  );
}
