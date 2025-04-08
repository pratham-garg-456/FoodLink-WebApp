import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';

export default function DonationTracker() {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const checkTokenAndFetchDonations = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const decodedToken = await validateToken(token);
        // Use the donor's id from the decoded token
        fetchDonations(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token:', error);
        router.push('/auth/login');
      }
    };
    checkTokenAndFetchDonations();
  }, [router]);

  const fetchDonations = async (donorId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setErrorMessage('Error fetching donations. Please try again later.');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 w-full md:w-[70vw] flex flex-col min-h-[70vh]">
      <h1 className="text-5xl font-bold mb-4 text-center">DONATIONS</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* TABLE: visible on md+ screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-2xl">
              <th className="border p-2">Amount ($)</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {donations.length > 0 ? (
              donations.map((donation, index) => (
                <tr key={donation.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                  <td className="border p-2 text-xl">${donation.amount.toFixed(2)}</td>
                  <td className="border p-2 text-xl">{donation.status}</td>
                  <td className="border p-2 text-xl">
                    {new Date(donation.created_at).toDateString()}
                  </td>
                  <td className="border p-2 text-xl">
                    {new Date(donation.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-5xl">
                  No donations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARDS: visible on small screens */}
      <div className="block md:hidden space-y-2">
        {donations.length > 0 ? (
          donations.map((donation, index) => (
            <div
              key={donation.id}
              className={`border border-gray-300 p-4 ${
                index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <p>
                <strong>Amount ($):</strong> ${donation.amount.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {donation.status}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(donation.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center p-4 bg-gray-100 text-gray-600">No donations yet</div>
        )}
      </div>
    </div>
  );
}
