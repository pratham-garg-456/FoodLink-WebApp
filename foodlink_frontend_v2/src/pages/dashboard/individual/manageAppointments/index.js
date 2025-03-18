import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';

const IndividualDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatDate = (date) => {
    // Create a Date object from the input UTC date
    const dateObj = new Date(date);

    // Adjust the time by subtracting 4 hours to convert from UTC to your local time (UTC-4)
    dateObj.setHours(dateObj.getHours() - 4);

    // Use toLocaleString to format the date in your local time zone
    return dateObj.toLocaleString('en-US');
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const decodedToken = await validateToken(token);
      if (decodedToken.error) {
        console.error('Invalid token: ', decodedToken.error);
        router.push('/auth/login');
        return;
      }
    };

    checkToken();
    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
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

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments. Status: ${response.status}`);
      }

      const data = await response.json();
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row  md:w-[90vw] md:justify-between  md:gap-2">
      {/* Left Section */}
      <div className="md:pr-4 flex flex-col  items-center md:items-start justify-center">
        <h1 className="text-3xl md:text-6xl text-center mt-5 font-bold text-gray-900 md:text-start  mb-12">
          Manage your Appointment
        </h1>

        <div className="flex flex-wrap justify-center gap-2 md:justify-start mb-10">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.push('/dashboard/individual/manageAppointments/book')}
          >
            Book an Appointment
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className=" flex flex-col justify-center items-center mb-5 md:mb-0">
        {/* Upcoming Appointments */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6 md:mb-0">
            Booked Appointments
          </h1>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : appointments.length > 0 ? (
            <ul className="space-y-6 md:space-y-0">
              {appointments.map((appointment) => (
                <li key={appointment._id} className="p-6 border-b border-gray-300 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800">{appointment.description}</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Start Time:</strong> {formatDate(appointment.start_time)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>End Time:</strong> {formatDate(appointment.end_time)}
                  </p>
                  <div className="mt-4">
                    <strong className="text-gray-800">Products:</strong>
                    <ul className="space-y-2 mt-2">
                      {appointment.product.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {item.food_name}: {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
