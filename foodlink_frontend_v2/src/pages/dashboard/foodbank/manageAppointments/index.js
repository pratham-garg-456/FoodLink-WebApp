import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';
import { OrbitProgress } from 'react-loading-indicators';

const ViewAppointments = () => {
  const router = useRouter();
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
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

  const handleMarkAsPicked = async () => {
    if (!selectedAppointment) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Make the API request to update the status
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/appointment/${selectedAppointment._id}`,
        { updated_status: 'picked' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state after marking as picked
      setAllAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === selectedAppointment._id ? { ...appt, status: 'picked' } : appt
        )
      );

      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error marking appointment as picked:', error);
    }
  };

  return (
    <div className="min-h-screen my-20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Appointment Management</h1>
          <p className="mt-2 text-center text-gray-600">Manage and track all appointments</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Filter Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="picked">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredAppointments.length} appointments
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm">
            <OrbitProgress
              color="#3B82F6"
              size="large"
              text="Loading appointments..."
              textColor="#4B5563"
            />
          </div>
        ) : errorMessage ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded min-h-[200px] flex items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="hidden md:block">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden min-h-[400px]">
                {filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] p-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No appointments found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no appointments with status: {statusFilter}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Start Time
                        </th>
                        <th
                          scope="col"
                          className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          End Time
                        </th>
                        <th
                          scope="col"
                          className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 truncate text-sm font-medium text-gray-900">
                            {individualUsernames[appointment.individual_id] ||
                              appointment.individual_id}
                          </td>
                          <td className="px-6 py-4 truncate text-sm text-gray-500">
                            {formatDate(appointment.start_time)}
                          </td>
                          <td className="px-6 py-4 truncate text-sm text-gray-500">
                            {formatDate(appointment.end_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${
                                appointment.status === 'scheduled'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : appointment.status === 'picked'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleViewDetail(appointment)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Card View for Mobile */}
            <div className="block md:hidden">
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no appointments with status: {statusFilter}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {individualUsernames[appointment.individual_id] ||
                              appointment.individual_id}
                          </h3>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Start:</span>{' '}
                              {formatDate(appointment.start_time)}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">End:</span>{' '}
                              {formatDate(appointment.end_time)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${
                            appointment.status === 'scheduled'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : appointment.status === 'picked'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => handleViewDetail(appointment)}
                          className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {isModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1 text-gray-900">
                    {selectedAppointment.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Time</p>
                    <p className="mt-1 text-gray-900">
                      {formatDate(selectedAppointment.start_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Time</p>
                    <p className="mt-1 text-gray-900">{formatDate(selectedAppointment.end_time)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Products</p>
                  <div className="bg-gray-50 rounded-md p-3">
                    <ul className="space-y-2">
                      {selectedAppointment.product.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span className="text-gray-900">{item.food_name}</span>
                          <span className="text-gray-600">
                            {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`mt-1 px-2 py-1 text-sm font-semibold rounded-full inline-block
                    ${
                      selectedAppointment.status === 'scheduled'
                        ? 'bg-green-100 text-green-800'
                        : selectedAppointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : selectedAppointment.status === 'picked'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedAppointment.status.charAt(0).toUpperCase() +
                      selectedAppointment.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                {(selectedAppointment.status === 'scheduled' ||
                  selectedAppointment.status === 'rescheduled') && (
                  <>
                    <button
                      onClick={handleCancelAppointment}
                      disabled={isCancelling}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                    </button>
                    <button
                      onClick={handleMarkAsPicked}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Mark as Picked
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointments;
