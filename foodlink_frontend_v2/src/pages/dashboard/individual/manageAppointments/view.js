import { useState, useEffect } from 'react';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [foodbankUsernames, setFoodbankUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // To store the selected appointment for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility

  const formatDate = (date) => {
    // Create a Date object from the input UTC date
    const dateObj = new Date(date);

    // Adjust the time by subtracting 4 hours to convert from UTC to your local time (UTC-4)
    dateObj.setHours(dateObj.getHours() - 4);

    // Use toLocaleString to format the date in your local time zone
    return dateObj.toLocaleString('en-US');
  };

  const getUsername = async (userId) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/foodlink/misc/users'); // Replace with your actual API endpoint
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const users = data.users; // Extract the 'users' array from the response
      console.log('users in Index individual:', users);
      const matchedUser = users.find((user) => user.id === userId);
      return matchedUser ? matchedUser.name : userId.slice(0, 5);
    } catch (error) {
      console.error('Error fetching users:', error);
      return 'Guest'; // Default name if there's an error
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('Fetching appointments...');

        const token = localStorage.getItem('accessToken'); // Get token from localStorage
        console.log('Retrieved token:', token);

        if (!token) {
          setError('Unauthorized. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          'http://localhost:8000/api/v1/foodlink/individual/appointments',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch appointments. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched appointments:', data);

        setAppointments(data.appointments); // Assuming data is an array of appointments
      } catch (err) {
        console.error('Error fetching appointments:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('Finished fetching appointments.');
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

  return (
    <div className="bg-white p-8 shadow-lg ">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Appointments History
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : appointments.length > 0 ? (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Food Bank</th>
              <th className="py-2 px-4 border-b text-left">Start Time</th>
              <th className="py-2 px-4 border-b text-left">End Time</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td className="py-2 px-4 border-b">
                  {foodbankUsernames[appointment.foodbank_id] || appointment.foodbank_id}
                </td>
                <td className="py-2 px-4 border-b">{formatDate(appointment.start_time)}</td>
                <td className="py-2 px-4 border-b">{formatDate(appointment.end_time)}</td>
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
      ) : (
        <p className="text-center text-gray-600">No appointments found.</p>
      )}

      {/* Modal */}
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
            <div className="mt-4">
              <strong className="text-gray-800">Products:</strong>
              <ul className="space-y-2 mt-2">
                {selectedAppointment.product.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600">
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
  );
};

export default ViewAppointments;
