import { useState, useEffect } from 'react';
import { OrbitProgress } from 'react-loading-indicators';
const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [foodbankUsernames, setFoodbankUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // To store the selected appointment for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility
  const [filterStatus, setFilterStatus] = useState(''); // New state for filter
  const [sortColumn, setSortColumn] = useState('start_time'); // Set default sorting column to 'start_time'
  const [sortOrder, setSortOrder] = useState('asc'); // Set default sorting order to 'asc'

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
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Unauthorized. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/appointments`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`Failed to fetch appointments. Status: ${response.status}`);

        const data = await response.json();
        setAppointments(data.appointments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchFoodbankNames = async () => {
      const usernames = {};
      for (const appointment of appointments) {
        const foodbankName = await getUsername(appointment.foodbank_id);
        usernames[appointment.foodbank_id] = foodbankName;
      }
      setFoodbankUsernames(usernames);
    };

    if (appointments.length > 0) {
      fetchFoodbankNames();
    }
  }, [appointments]);

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // Function to handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  // Filtered appointments based on the selected status
  const filteredAppointments = appointments.filter((appointment) => {
    return filterStatus ? appointment.status === filterStatus : true;
  });

  // Function to handle sorting
  const handleSort = (column) => {
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  // Sort appointments based on the selected criteria
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    let comparison = 0;
    const foodbankA = foodbankUsernames[a.foodbank_id] || a.foodbank_id;
    const foodbankB = foodbankUsernames[b.foodbank_id] || b.foodbank_id;

    // Prioritize "scheduled" status
    const statusOrder = { scheduled: 1, completed: 2, reschedule: 3, cancelled: 4 };
    comparison = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);

    if (comparison === 0) {
      if (sortColumn === 'start_time') {
        comparison = new Date(a.start_time) - new Date(b.start_time);
      } else if (sortColumn === 'end_time') {
        comparison = new Date(a.end_time) - new Date(b.end_time);
      } else if (sortColumn === 'foodbank') {
        comparison = foodbankA.localeCompare(foodbankB);
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col my-16 w-[90vw] justify-center items-center md:my-24 h-full">
      <h1 className="text-center text-4xl font-bold mb-8 text-gray-800">Appointments History</h1>
      <div className="bg-white p-8 rounded-lg shadow-2xl md:w-[80vw] w-full text-xs md:text-base">
        {/* Filter and Sort Controls */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <label
                htmlFor="statusFilter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={handleFilterChange}
                className="block w-48 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Appointments</option>
                <option value="scheduled" className="text-blue-600">
                  Scheduled
                </option>
                <option value="reschedule" className="text-orange-600">
                  Reschedule
                </option>
                <option value="picked" className="text-green-600">
                  Completed
                </option>
                <option value="cancelled" className="text-red-600">
                  Cancelled
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total: {sortedAppointments.length}</span>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <OrbitProgress color="#3B82F6" size="large" text="" textColor="" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : sortedAppointments.length > 0 ? (
          <>
            {/* TABLE: visible on md+ screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('foodbank')}
                    >
                      <div className="flex items-center gap-2">
                        Food Bank
                        <span className="text-gray-400">
                          {sortColumn === 'foodbank' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </span>
                      </div>
                    </th>
                    <th
                      className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('start_time')}
                    >
                      <div className="flex items-center gap-2">
                        Start Time
                        <span className="text-gray-400">
                          {sortColumn === 'start_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </span>
                      </div>
                    </th>
                    <th
                      className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('end_time')}
                    >
                      <div className="flex items-center gap-2">
                        End Time
                        <span className="text-gray-400">
                          {sortColumn === 'end_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {foodbankUsernames[appointment.foodbank_id] || appointment.foodbank_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                          ${appointment.status === 'picked' ? 'bg-green-100 text-green-800' : ''}
                          ${appointment.status === 'reschedule' ? 'bg-orange-100 text-orange-800' : ''}
                          ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetail(appointment)}
                          className="text-blue-600 hover:text-blue-900 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARDS: visible on small screens */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {sortedAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-900">
                      {foodbankUsernames[appointment.foodbank_id] || appointment.foodbank_id}
                    </div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                      ${appointment.status === 'picked' ? 'bg-green-100 text-green-800' : ''}
                      ${appointment.status === 'reschedule' ? 'bg-orange-100 text-orange-800' : ''}
                      ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>
                      <span className="font-medium">Start:</span>{' '}
                      {formatDate(appointment.start_time)}
                    </p>
                    <p>
                      <span className="font-medium">End:</span> {formatDate(appointment.end_time)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetail(appointment)}
                    className="mt-3 w-full text-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No appointments found.</p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-[90vw] sm:w-[500px] max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAppointment.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Time Details</h3>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Start Time</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedAppointment.start_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Time</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedAppointment.end_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Products</h3>
                    <ul className="mt-2 divide-y divide-gray-200">
                      {selectedAppointment.product.map((item, index) => (
                        <li key={index} className="py-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-900">{item.food_name}</span>
                            <span className="text-sm text-gray-500">
                              {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={closeModal}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointments;
