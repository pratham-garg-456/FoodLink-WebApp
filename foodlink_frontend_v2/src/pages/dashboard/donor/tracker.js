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
    <div className="container mx-auto p-6 w-[70vw] flex flex-col justify-start h-[70vh]">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">DONATIONS</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
          {donations.length > 0 ? (
            donations.map((donation, index) => (
              <tr key={donation.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                <td className="border p-2">{donation.id}</td>
                <td className="border p-2">${donation.amount.toFixed(2)}</td>
                <td className="border p-2">{donation.status}</td>
                <td className="border p-2">{new Date(donation.created_at).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No donations yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
