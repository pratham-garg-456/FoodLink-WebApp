import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const DonationTracker = () => {
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [foodbankId, setFoodbankId] = useState('');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Donations',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
        setFoodbankId(decodedToken.user.id);
        fetchDonations(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);

  const fetchDonations = async (foodbankId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/donations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      let donationsData = response.data.donations;
  
      // Sort donations by amount in descending order
      donationsData = donationsData.sort((a, b) => b.amount - a.amount);
  
      setDonations(donationsData.slice(0, 5)); // Display top 5 donations
      prepareChartData(donationsData);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setErrorMessage('Error fetching donations. Please try again later.');
    }
  };

  const prepareChartData = (donationsData) => {
    const months = [];
    const amounts = [];

    donationsData.forEach((donation) => {
      const month = new Date(donation.created_at).toLocaleString('default', { month: 'short' });
      if (!months.includes(month)) {
        months.push(month);
        amounts.push(donation.amount);
      } else {
        const index = months.indexOf(month);
        amounts[index] += donation.amount;
      }
    });

    setChartData({
      labels: months,
      datasets: [
        {
          label: 'Donations',
          data: amounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  return (
    <div className="container mx-auto p-6 w-full md:w-[70vw] flex flex-col justify-start min-h-screen md:min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-4 text-center">DONATIONS</h1>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* TABLE (hidden on small screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Donation ID</th>
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
                  <td className="border p-2">{donation.id}</td>
                  <td className="border p-2">{donation.donor_id}</td>
                  <td className="border p-2">${donation.amount.toFixed(2)}</td>
                  <td className="border p-2">{donation.status}</td>
                  <td className="border p-2">
                    {new Date(donation.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No donations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARD VIEW (visible on small screens) */}
      <div className="block md:hidden space-y-2">
        {donations.length > 0 ? (
          donations.map((donation, index) => (
            <div key={index} className="border border-gray-300 p-4 shadow-sm">
              <p>
                <strong>Donation ID:</strong> {donation.id}
              </p>
              <p>
                <strong>Donor ID:</strong> {donation.donor_id}
              </p>
              <p>
                <strong>Amount ($):</strong> ${donation.amount.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {donation.status}
              </p>
              <p>
                <strong>Timestamp:</strong>{' '}
                {new Date(donation.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center p-4 bg-gray-100 text-gray-600">
            No donations yet
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Donations Over the Last Few Months</h2>
        <div className="w-full h-64">
          <Bar data={chartData} />
        </div>
      </div>

      {/* Manage Donations Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => router.push('/dashboard/foodbank/manageDonations/viewDonations')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Manage Donations
        </button>
      </div>
    </div>
  );
};

export default DonationTracker;