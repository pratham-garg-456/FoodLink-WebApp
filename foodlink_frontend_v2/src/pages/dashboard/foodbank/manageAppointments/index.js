import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';

const ViewAppointments = () => {
  const router = useRouter();
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [foodbankUsernames, setFoodbankUsernames] = useState({});
  const [individualUsernames, setIndividualUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('scheduled');
  const [isCancelling, setIsCancelling] = useState(false); // Track cancellation state

  const formatDate = (date) => {
    const dateObj = new Date(date);
    dateObj.setHours(dateObj.getHours() - 4);
    return dateObj.toLocaleString('en-US');
  };

  const getUsername = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
      );
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      const matchedUser = data.users.find((user) => user.id === userId);
      return matchedUser ? matchedUser.name : userId.slice(0, 5);
    } catch (error) {
      console.error('Error fetching users:', error);
      return 'Guest';
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAppointments = async () => {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
        if (!decodedToken) {
          router.push('/auth/login');
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (isMounted) {
          if (response.data.status === 'success') {
            setAllAppointments(response.data.appointments || []);
            setErrorMessage(null);
          } else {
            setAllAppointments([]);
            setErrorMessage('No appointments found.');
          }
        }
      } catch (error) {
        if (isMounted) {
          setAllAppointments([]);
          setErrorMessage(error.response ? error.response.data.message : 'An error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    setFilteredAppointments(
      allAppointments.filter((appointment) => appointment.status === statusFilter)
    );
  }, [statusFilter, allAppointments]);

  useEffect(() => {
    const fetchIndividualNames = async () => {
      const usernames = {};
      for (const appointment of filteredAppointments) {
        const individualUsername = await getUsername(appointment.individual_id);
        usernames[appointment.individual_id] = individualUsername;
      }
      setIndividualUsernames(usernames);
    };

    if (filteredAppointments.length > 0) fetchIndividualNames();
  }, [filteredAppointments]);

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setIsCancelling(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Make the API request to update the status
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/appointment/${selectedAppointment._id}`,
        { updated_status: 'cancelled' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state after cancellation
      setAllAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === selectedAppointment._id ? { ...appt, status: 'cancelled' } : appt
        )
      );

      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Manage Appointments
      </h1>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="mr-2">Filter by Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Loading / Error / Table & Cards */}
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : errorMessage ? (
        <p className="text-center text-red-500">{errorMessage}</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="text-center text-gray-600">
          No appointments found for the selected status.
        </p>
      ) : (
        <>
          {/* TABLE: visible on md+ screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Start Time</th>
                  <th className="py-2 px-4 border-b">End Time</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="py-2 px-4 border-b">
                      {individualUsernames[appointment.individual_id] ||
                        appointment.individual_id}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(appointment.start_time)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(appointment.end_time)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleViewDetail(appointment)}
                        className="text-blue-500 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARD VIEW: visible on small screens */}
          <div className="block md:hidden space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border rounded p-4 shadow-sm"
              >
                <p>
                  <strong>Name:</strong>{' '}
                  {individualUsernames[appointment.individual_id] ||
                    appointment.individual_id}
                </p>
                <p>
                  <strong>Start Time:</strong> {formatDate(appointment.start_time)}
                </p>
                <p>
                  <strong>End Time:</strong> {formatDate(appointment.end_time)}
                </p>
                <button
                  onClick={() => handleViewDetail(appointment)}
                  className="text-blue-500 hover:underline mt-2 block"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Appointment Details */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
            <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
            <p>
              <strong>Description:</strong> {selectedAppointment.description}
            </p>
            <p>
              <strong>Start Time:</strong> {formatDate(selectedAppointment.start_time)}
            </p>
            <p>
              <strong>End Time:</strong> {formatDate(selectedAppointment.end_time)}
            </p>
            <ul className="space-y-2 mt-2">
              {selectedAppointment.product.map((item, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {item.food_name}: {item.quantity}{' '}
                  {item.quantity > 1 ? 'items' : 'item'}
                </li>
              ))}
            </ul>
            <p>
              <strong>Status:</strong> {selectedAppointment.status}
            </p>
            {(selectedAppointment.status === 'scheduled' ||
              selectedAppointment.status === 'rescheduled') && (
              <button
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="bg-red-500 text-white px-4 py-2 rounded mt-4"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            )}
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAppointments;
