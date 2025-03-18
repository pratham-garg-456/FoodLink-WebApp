import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import Modal from 'react-modal';

const ViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [foodbankId, setFoodbankId] = useState('');
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
        setFoodbankId(decodedToken.user.id);
        fetchDonations(decodedToken.user.id);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);

  const fetchDonations = async () => {
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
  };

  const handleSearch = async () => {
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

  return (
    <div className="container mx-auto p-6 w-[70vw] flex flex-col justify-start h-[75vh]">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">Manage Donations</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="mb-4 flex justify-between">
        <button
          onClick={() => setSearchModalIsOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Reset
        </button>
      </div>
      <div className="overflow-auto h-[80vh]">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="sticky-header" style={{ position: 'sticky', top: 0 }}>
            <tr className="bg-gray-200">
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('id')}>
                Donation ID
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('donor_id')}>
                Donor ID
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('amount')}>
                Amount ($)
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('status')}>
                Status
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('created_at')}>
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDonations.length > 0 ? (
              sortedDonations.map((donation, index) => (
                <tr key={index} className="border">
                  <td className="border p-2">{donation.id}</td>
                  <td className="border p-2">{donation.donor_id}</td>
                  <td className="border p-2">${donation.amount.toFixed(2)}</td>
                  <td className="border p-2">
                    <span className="font-bold text-blue-500">{donation.status}</span>
                  </td>
                  <td className="border p-2">{new Date(donation.updated_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No donations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={searchModalIsOpen}
        onRequestClose={() => setSearchModalIsOpen(false)}
        contentLabel="Search Donations"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Search Donations</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="mb-4">
              <label htmlFor="donor_id" className="block text-sm font-medium text-gray-600">
                Donor ID
              </label>
              <input
                id="donor_id"
                type="text"
                value={searchParams.donor_id}
                onChange={(e) => setSearchParams({ ...searchParams, donor_id: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="donation_id" className="block text-sm font-medium text-gray-600">
                Donation ID
              </label>
              <input
                id="donation_id"
                type="text"
                value={searchParams.donation_id}
                onChange={(e) => setSearchParams({ ...searchParams, donation_id: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-600">
                Start Time
              </label>
              <input
                id="start_time"
                type="datetime-local"
                value={searchParams.start_time}
                onChange={(e) => setSearchParams({ ...searchParams, start_time: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-600">
                End Time
              </label>
              <input
                id="end_time"
                type="datetime-local"
                value={searchParams.end_time}
                onChange={(e) => setSearchParams({ ...searchParams, end_time: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-600">
                Status
              </label>
              <input
                id="status"
                type="text"
                value={searchParams.status}
                onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="min_amount" className="block text-sm font-medium text-gray-600">
                Min Amount ($)
              </label>
              <input
                id="min_amount"
                type="number"
                value={searchParams.min_amount}
                onChange={(e) => setSearchParams({ ...searchParams, min_amount: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="max_amount" className="block text-sm font-medium text-gray-600">
                Max Amount ($)
              </label>
              <input
                id="max_amount"
                type="number"
                value={searchParams.max_amount}
                onChange={(e) => setSearchParams({ ...searchParams, max_amount: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSearchModalIsOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ViewDonations;
