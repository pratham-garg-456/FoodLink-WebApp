import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const DonationTracker = () => {
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'error') {
          setErrorMessage(data.detail);
        } else {
          setDonations(data);
        }
      })
      .catch((error) => console.error('Error fetching donations:', error));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Donation Tracker</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Donor ID</th>
            <th className="border p-2">Amount ($)</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {donations.length > 0 ? (
            donations.map((donation, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{donation.donor_id}</td>
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
};

export default DonationTracker;
