import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import Modal from 'react-modal';
import { OrbitProgress } from 'react-loading-indicators';

const ViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    donor_id: '',
    donation_id: '',
    start_time: '',
    end_time: '',
    status: '',
    min_amount: '',
    max_amount: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });

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
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setErrorMessage('Error fetching donations. Please try again later.');
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const params = {};
    if (searchParams.donor_id) params.donor_id = searchParams.donor_id;
    if (searchParams.donation_id) params.donation_id = searchParams.donation_id;
    if (searchParams.start_time) params.start_time = searchParams.start_time;
    if (searchParams.end_time) params.end_time = searchParams.end_time;
    if (searchParams.status) params.status = searchParams.status;
    if (searchParams.min_amount) params.min_amount = searchParams.min_amount;
    if (searchParams.max_amount) params.max_amount = searchParams.max_amount;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/donations/search`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setDonations(response.data.donations);
      setSearchModalIsOpen(false); // Close the search modal
    } catch (error) {
      console.error('Error searching donations:', error);
      setErrorMessage('Error searching donations. Please try again later.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      donor_id: '',
      donation_id: '',
      start_time: '',
      end_time: '',
      status: '',
      min_amount: '',
      max_amount: '',
    });
    fetchDonations();
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedDonations = [...donations].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    date.setHours(date.getHours() + 4);
    return date.toTimeString().split(' ')[0].slice(0, 5);
  };
  return (
    <div className="container mx-auto p-8 w-full md:w-[80vw] flex flex-col justify-start min-h-screen ">
      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <OrbitProgress color="#3B82F6" size="large" text="" textColor="" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 border-b pb-4">
              Manage Donations
            </h1>

            {errorMessage && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                role="alert"
              >
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => setSearchModalIsOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Search
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center gap-2 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Reset
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('id')}
                      >
                        Donation ID
                        {sortConfig.key === 'id' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('donor_id')}
                      >
                        Donor ID
                        {sortConfig.key === 'donor_id' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('amount')}
                      >
                        Amount ($)
                        {sortConfig.key === 'amount' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('created_at')}
                      >
                        Timestamp
                        {sortConfig.key === 'created_at' && (
                          <span className="ml-2">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedDonations.length > 0 ? (
                      sortedDonations.map((donation, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {donation.id}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {donation.donor_id}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            ${donation.amount.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(donation.updated_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50"
                        >
                          No donations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Modal
            isOpen={searchModalIsOpen}
            onRequestClose={() => setSearchModalIsOpen(false)}
            contentLabel="Search Donations"
            className="fixed inset-0 flex items-center justify-center"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Search Donations</h2>
                <button
                  onClick={() => setSearchModalIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="donor_id" className="block text-sm font-medium text-gray-700">
                    Donor ID
                  </label>
                  <input
                    id="donor_id"
                    type="text"
                    value={searchParams.donor_id}
                    onChange={(e) => setSearchParams({ ...searchParams, donor_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="donation_id" className="block text-sm font-medium text-gray-700">
                    Donation ID
                  </label>
                  <input
                    id="donation_id"
                    type="text"
                    value={searchParams.donation_id}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, donation_id: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    id="start_time"
                    type="datetime-local"
                    value={searchParams.start_time}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, start_time: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    id="end_time"
                    type="datetime-local"
                    value={searchParams.end_time}
                    onChange={(e) => setSearchParams({ ...searchParams, end_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    value={searchParams.status}
                    onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="min_amount" className="block text-sm font-medium text-gray-700">
                    Min Amount ($)
                  </label>
                  <input
                    id="min_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={searchParams.min_amount}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, min_amount: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="max_amount" className="block text-sm font-medium text-gray-700">
                    Max Amount ($)
                  </label>
                  <input
                    id="max_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={searchParams.max_amount}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, max_amount: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setSearchModalIsOpen(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ViewDonations;
