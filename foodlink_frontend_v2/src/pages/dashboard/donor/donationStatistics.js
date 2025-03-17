import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function DonationStatistics() {
  const router = useRouter();
  const [statistics, setStatistics] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations/statistics`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
        );
        setStatistics(response.data.statistics);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setErrorMessage('Error fetching donation statistics.');
      }
    };
    fetchStatistics();
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Donation Statistics</h1>
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      {statistics ? (
        <div className="max-w-xl mx-auto border p-4 rounded shadow">
          <p>
            <strong>Total Donations:</strong> ${statistics.total_donations}
          </p>
          <p>
            <strong>Total Food Donated:</strong> {statistics.total_food_donated}
          </p>
          <h2 className="mt-4 font-bold">Donation Trend:</h2>
          <ul className="list-disc pl-5">
            {statistics.donation_trend.map((trend, index) => (
              <li key={index}>
                {trend.month}: ${trend.amount}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center">Loading statistics...</p>
      )}
    </div>
  );
}
