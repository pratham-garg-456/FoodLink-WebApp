import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import validateToken from '@/utils/validateToken';
import { OrbitProgress } from 'react-loading-indicators';

const IndividualDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatDate = (date) => {
    const dateObj = new Date(date);
    dateObj.setHours(dateObj.getHours() - 4);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/appointments`,
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

      // Filter appointments to only include 'Scheduled' or 'Rescheduled' ones
      const filteredAppointments = data.appointments.filter(
        (appointment) => appointment.status === 'scheduled' || appointment.status === 'rescheduled'
      );

      setAppointments(filteredAppointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col my-16 w-[90vw] justify-center items-center md:my-24 h-full">
      {/* Main Content Container */}
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Appointment Management</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book new appointments or view your appointment history with food banks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            onClick={() => router.push('/dashboard/individual/manageAppointments/book')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Book an Appointment
          </button>
          <button
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            onClick={() => router.push('/dashboard/individual/manageAppointments/view')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            View Appointments History
          </button>
        </div>

        {/* Upcoming Appointments Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Upcoming Appointments</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {appointments.length} Active
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <OrbitProgress color="#3B82F6" size="large" text="" textColor="" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {appointment.description || 'Scheduled Appointment'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                      ${appointment.status === 'rescheduled' ? 'bg-orange-100 text-orange-800' : ''}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">{formatDate(appointment.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">{formatDate(appointment.end_time)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    <ul className="space-y-1">
                      {appointment.product.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.food_name}</span>
                          <span className="text-gray-500">
                            {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600">No upcoming appointments</p>
              <p className="text-sm text-gray-500">Click "Book an Appointment" to schedule one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
