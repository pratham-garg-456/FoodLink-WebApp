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
      <h1 className="text-center text-4xl font-bold mb-4">Appointments History</h1>
      <div className="bg-white p-8 shadow-xl md:w-[80vw] w-full text-xs md:text-base">
        {/* Filter Section */}
        <div className="mb-4">
          <label htmlFor="statusFilter" className="mr-2">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="reschedule">Reschedule</option>
            <option value="scheduled">Scheduled</option>
            <option value="picked">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Loading/Error */}
        {loading ? (
          <div class="flex items-center justify-center">
            <OrbitProgress color="#000000" size="large" text="" textColor="" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : sortedAppointments.length > 0 ? (
          <>
            {/* TABLE: visible on md+ screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      className="py-2 px-4 border-b text-left cursor-pointer"
                      onClick={() => handleSort('foodbank')}
                    >
                      Food Bank
                      {sortColumn === 'foodbank' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="py-2 px-4 border-b text-left cursor-pointer"
                      onClick={() => handleSort('start_time')}
                    >
                      Start Time
                      {sortColumn === 'start_time' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="py-2 px-4 border-b text-left cursor-pointer"
                      onClick={() => handleSort('end_time')}
                    >
                      End Time
                      {sortColumn === 'end_time' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="py-2 px-4 border-b text-left cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortColumn === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="py-2 px-4 border-b">
                        {foodbankUsernames[appointment.foodbank_id] || appointment.foodbank_id}
                      </td>
                      <td className="py-2 px-4 border-b">{formatDate(appointment.start_time)}</td>
                      <td className="py-2 px-4 border-b">{formatDate(appointment.end_time)}</td>
                      <td className="py-2 px-4 border-b">{appointment.status}</td>
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

            {/* CARDS: visible on small screens */}
            <div className="block md:hidden space-y-4">
              {sortedAppointments.map((appointment) => (
                <div key={appointment._id} className="border rounded p-4 shadow-sm">
                  <p className="mb-2">
                    <strong>Food Bank:</strong>{' '}
                    {foodbankUsernames[appointment.foodbank_id] || appointment.foodbank_id}
                  </p>
                  <p className="mb-2">
                    <strong>Start Time:</strong> {formatDate(appointment.start_time)}
                  </p>
                  <p className="mb-2">
                    <strong>End Time:</strong> {formatDate(appointment.end_time)}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> {appointment.status}
                  </p>
                  <button
                    onClick={() => handleViewDetail(appointment)}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No appointments found.</p>
        )}

        {/* Modal */}
        {isModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90vw] sm:w-96 max-h-[80vh] overflow-y-auto">
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
              <div className="mt-4">
                <strong className="text-gray-800">Products:</strong>
                <ul className="mt-2">
                  {selectedAppointment.product.map((item, index) => (
                    <li key={index} className="text-xs text-gray-600 md:text-base">
                      {item.food_name}: {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-right">
                <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded">
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
