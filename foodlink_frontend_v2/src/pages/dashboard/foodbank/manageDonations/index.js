import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { OrbitProgress } from 'react-loading-indicators';

const DonationTracker = () => {
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
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
  const [loading, setLoading] = useState(false);
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
        fetchDonations(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);

  const fetchDonations = async () => {
    setLoading(true);
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
    setLoading(false);
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

  const formatDateToLocal = (isoString) => {
    if (!isoString) return 'N/A';
    const utcDate = new Date(isoString + 'Z'); // Force UTC interpretation
    return utcDate.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="container mx-auto p-8 w-full md:w-[80vw] flex flex-col justify-start min-h-screen md:min-h-[80vh] ">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <OrbitProgress color="#3B82F6" size="large" text="" textColor="" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 border-b pb-4">
              Donation Dashboard
            </h1>

            {errorMessage && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                role="alert"
              >
                <p>{errorMessage}</p>
              </div>
            )}

            {/* TABLE (hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Amount ($)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donations.length > 0 ? (
                    donations.map((donation, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          ${donation.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium
                            ${
                              donation.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : donation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateToLocal(donation.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500 bg-gray-50">
                        No donations recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CARD VIEW (visible on small screens) */}
            <div className="block md:hidden space-y-4">
              {donations.length > 0 ? (
                donations.map((donation, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-800">
                        ${donation.amount.toFixed(2)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          donation.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Received:</span>{' '}
                      {formatDateToLocal(donation.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500">
                  No donations recorded yet
                </div>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
              Monthly Donation Trends
            </h2>
            <div className="w-full h-80">
              <Bar
                data={{
                  ...chartData,
                  datasets: [
                    {
                      ...chartData.datasets[0],
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Manage Donations Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push('/dashboard/foodbank/manageDonations/viewDonations')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
            >
              Manage Donations
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DonationTracker;
