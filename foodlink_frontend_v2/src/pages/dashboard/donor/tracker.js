import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import validateToken from '@/utils/validateToken';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DonationTracker() {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [chartData, setChartData] = useState(null);
  const [trendChartData, setTrendChartData] = useState(null);
  const [filter, setFilter] = useState({ status: '', startDate: '', endDate: '' });
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTokenAndFetchDonations = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const decodedToken = await validateToken(token);
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
      const fetchedDonations = response.data.donations;
      setDonations(fetchedDonations);
      prepareChartData(fetchedDonations);
      prepareTrendChartData(fetchedDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setErrorMessage('Error fetching donations. Please try again later.');
    }
  };

  const prepareChartData = (donations) => {
    const labels = donations.map((donation) => new Date(donation.created_at).toLocaleDateString());
    const data = donations.map((donation) => donation.amount);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Recent Donations ($)',
          data,
          borderColor: 'rgb(75, 85, 192)',
          backgroundColor: 'rgba(87, 75, 192, 0.2)',
          tension: 0.4,
        },
      ],
    });
  };

  const prepareTrendChartData = (donations) => {
    const monthlyData = donations.reduce((acc, donation) => {
      const month = new Date(donation.created_at).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + donation.amount;
      return acc;
    }, {});

    setTrendChartData({
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Monthly Donations ($)',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
      ],
    });
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredDonations = donations.filter((donation) => {
    const donationDate = new Date(donation.created_at);
    const startDate = filter.startDate ? new Date(filter.startDate) : null;
    const endDate = filter.endDate ? new Date(filter.endDate) : null;

    return (
      (!filter.status || donation.status === filter.status) &&
      (!startDate || donationDate >= startDate) &&
      (!endDate || donationDate <= endDate)
    );
  });

  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortOrder === 'asc') return a.amount - b.amount;
    return b.amount - a.amount;
  });

  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const successfulDonations = donations.filter(
    (donation) => donation.status === 'confirmed'
  ).length;

  if (loading)
    return (
      <div class="flex items-center justify-center">
        <OrbitProgress color="#000000" size="large" text="" textColor="" />
      </div>
    );

  const formatDateToLocal = (isoString) => {
    if (!isoString) return 'N/A';
    const utcDate = new Date(isoString + 'Z'); // Force UTC interpretation
    return utcDate.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className=" w-[90vw]  flex flex-col justify-center items-center min-h-[70vh] my-20">
      <h1 className="text-3xl font-bold mb-4 text-center">DONATIONS</h1>
      <div className="summary-section  p-4 rounded-lg shadow-lg mb-10 flex flex-row gap-4">
        <div className="flex flex-col justify-center items-center bg-green-100 p-2  rounded-lg shadow-md ">
          <p className="text-xl font-bold text-green-700">{donations.length}</p>
          <p className="  text-green-700">Donations</p>
        </div>
        <div className="bg-blue-100 p-2 rounded-lg shadow-md flex-1 text-center">
          <p className="text-xl font-bold text-blue-700">${totalAmount.toFixed(2)}</p>
          <p className="  text-blue-700">Donated</p>
        </div>
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="flex flex-col items-center w-full ">
        {/* Chart Section */}
        <div className="w-[100%] flex items-center justify-center mb-10 md:mb-10">
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 w-full md:w-[90%]">
            {chartData && (
              <div className="flex w-full h-44 md:h-full justify-end">
                <Line data={chartData} />
              </div>
            )}

            {/* Trend Chart Section */}
            {trendChartData && (
              <div className="flex w-full h-44 md:h-full justify-end">
                <Bar data={trendChartData} />
              </div>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="w-[90%] flex flex-col items-center mb-10 md:mb-0 md:order-1 ">
          <div className="mb-6 flex flex-wrap md:flex-row gap-4 w-[90%] md:justify-center">
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="border p-2 rounded"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Successful</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="border p-2 rounded"
            />
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="border p-2 rounded"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="desc">Sort by Amount (High to Low)</option>
              <option value="asc">Sort by Amount (Low to High)</option>
            </select>
          </div>

          {/* TABLE: visible on md+ screens */}
          <div className="hidden md:block overflow-x-auto md:w-full">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-xl">
                  <th className="border p-2">Amount ($)</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedDonations.length > 0 ? (
                  sortedDonations.map((donation, index) => (
                    <tr key={donation.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                      <td className="border p-2 text-l">${donation.amount.toFixed(2)}</td>
                      <td
                        className={`border p-2 text-l ${donation?.status === 'confirmed' ? 'text-green-500 font-bold' : 'text-red-300'}`}
                      >
                        {donation.status}
                      </td>
                      <td className="border p-2 text-l">
                        {new Date(donation.created_at).toDateString()}
                      </td>
                      <td className="border p-2 text-l">
                        {formatDateToLocal(donation.created_at)}
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
        </div>
        {/* CARDS: visible on small screens */}
        <div className="block md:hidden space-y-2">
          {sortedDonations.length > 0 ? (
            sortedDonations.map((donation, index) => (
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
                  <strong>Status:</strong>{' '}
                  <span
                    className={
                      donation?.status === 'confirmed' ? 'text-green-500 font-bold' : 'text-red-300'
                    }
                  >
                    {donation.status}
                  </span>
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
    </div>
  );
}
