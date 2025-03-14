import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import validateToken from '@/utils/validateToken';
import Modal from 'react-modal';

const ViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [foodbankId, setFoodbankId] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donor_id: '',
    amount: '',
    status: '',
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

  const handleSearch = () => {
    // Implement search logic here
  };

  const handleUpdate = (donationId) => {
    // Implement update logic here
  };

  const handleDelete = async (donationId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/donations/${donationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchDonations(); // Refresh the donations list
    } catch (error) {
      console.error('Error deleting donation:', error);
      setErrorMessage('Error deleting donation. Please try again later.');
    }
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/donations`,
        {
          donor_id: newDonation.donor_id,
          amount: parseFloat(newDonation.amount),
          status: newDonation.status,
          foodbank_id: foodbankId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setDonations([...donations, response.data.donation]);
      setModalIsOpen(false); // Close the modal
      setNewDonation({ donor_id: '', amount: '', status: '' }); // Reset the form
    } catch (error) {
      console.error('Error adding donation:', error);
      setErrorMessage('Error adding donation. Please try again later.');
    }
  };

  return (
    <div className="container mx-auto p-6 w-[70vw] flex flex-col justify-start h-[70vh]">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">Manage Donations</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Donation ID or Donor ID"
          className="border p-2 rounded-lg w-full"
        />
        <button onClick={handleSearch} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
          Search
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Donation ID</th>
            <th className="border p-2">Donor ID</th>
            <th className="border p-2">Amount ($)</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">Actions</th>
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
                <td className="border p-2">{new Date(donation.created_at).toLocaleString()}</td>
                <td className="border p-2">
                  <button onClick={() => handleUpdate(donation.id)} className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition duration-300">
                    Update
                  </button>
                  <button onClick={() => handleDelete(donation.id)} className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition duration-300 ml-2">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4">
                No donations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={() => setModalIsOpen(true)} className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300">
        Add Donation
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Add Donation"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Add Donation</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
            <div className="mb-4">
              <label htmlFor="donor_id" className="block text-sm font-medium text-gray-600">
                Donor ID
              </label>
              <input
                id="donor_id"
                type="text"
                value={newDonation.donor_id}
                onChange={(e) => setNewDonation({ ...newDonation, donor_id: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-600">
                Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                value={newDonation.amount}
                onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-600">
                Status
              </label>
              <input
                id="status"
                type="text"
                value={newDonation.status}
                onChange={(e) => setNewDonation({ ...newDonation, status: e.target.value })}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModalIsOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ViewDonations;