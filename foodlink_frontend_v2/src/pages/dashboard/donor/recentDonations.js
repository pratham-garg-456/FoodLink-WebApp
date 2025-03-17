import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function RecentDonations() {
  const router = useRouter();
  const [recentDonations, setRecentDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations/recent`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
        );
        setRecentDonations(response.data.recent_donations);
      } catch (error) {
        setErrorMessage('Error fetching recent donations.');
      }
    };
    fetchRecentDonations();
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Recent Donations</h1>
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      {recentDonations.length === 0 ? (
        <p className="text-center">No recent donations found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Donation ID</th>
              <th className="border p-2">Amount ($)</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {recentDonations.map((donation, index) => (
              <tr key={donation.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                <td className="border p-2">{donation.id}</td>
                <td className="border p-2">${donation.amount.toFixed(2)}</td>
                <td className="border p-2">{donation.status}</td>
                <td className="border p-2">{new Date(donation.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
