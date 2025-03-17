import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function DonationTracker() {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Donations ($)',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchDonations();
  }, [router]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/donor/donations/user`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      );
      let donationsData = response.data.donations;

      // Sort donations by amount descending
      donationsData = donationsData.sort((a, b) => b.amount - a.amount);

      // Set top 5 for table display
      setDonations(donationsData.slice(0, 5));

      // Prepare chart data (group by month)
      prepareChartData(donationsData);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setErrorMessage('Error fetching donations. Please try again later.');
    }
  };

  const prepareChartData = (donationsData) => {
    const monthTotals = {}; // { Jan: 500, Feb: 700, ... }

    donationsData.forEach((donation) => {
      const month = new Date(donation.created_at).toLocaleString('default', { month: 'short' });
      if (monthTotals[month]) {
        monthTotals[month] += donation.amount;
      } else {
        monthTotals[month] = donation.amount;
      }
    });

    const labels = Object.keys(monthTotals);
    const amounts = Object.values(monthTotals);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Donations ($)',
          data: amounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  return (
    <div className="container mx-auto p-6 w-[70vw] flex flex-col justify-start h-[80vh]">
      <h1 className="text-2xl font-bold mb-4 text-center">Your Donations</h1>
      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
      {donations.length === 0 ? (
        <p className="text-center">No donations found.</p>
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
            {donations.map((donation, index) => (
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
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 text-center">Donations Over the Last Few Months</h2>
        <div className="w-full h-64">
          <Bar data={chartData} />
        </div>
      </div>
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
}
