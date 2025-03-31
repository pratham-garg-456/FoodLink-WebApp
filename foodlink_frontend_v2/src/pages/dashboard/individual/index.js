import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import validateToken from '../../../utils/validateToken';
import Image from 'next/image';
import foodbank from '../../../../public/images/food-bank2.jpg';

const IndividualDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [foodbankUsernames, setFoodbankUsernames] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUsername = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
      ); // Replace with your actual API endpoint
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const users = data.users; // Extract the 'users' array from the response
      const matchedUser = users.find((user) => user.id === userId);
      return matchedUser ? matchedUser.name : userId.slice(0, 5);
    } catch (error) {
      console.error('Error fetching users:', error);
      return 'Guest'; // Default name if there's an error
    }
  };

  // Fetch usernames when appointments load
  useEffect(() => {
    const fetchUsernames = async () => {
      const newUsernames = {};
      for (const appt of appointments) {
        if (!foodbankUsernames[appt.foodbank_id]) {
          newUsernames[appt.foodbank_id] = await getUsername(appt.foodbank_id);
        }
      }
      setFoodbankUsernames((prev) => ({ ...prev, ...newUsernames }));
    };

    if (appointments.length > 0) fetchUsernames();
  }, [appointments]);

  useEffect(() => {
    const checkTokenAndFetchAppointments = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
        if (decodedToken.error) {
          console.error('Invalid token: ', decodedToken.error);
          router.push('/auth/login');
          return;
        }
        const userId = decodedToken.user.id;
        setUserId(userId);
        const username = await getUsername(userId);
        setUserName(username);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/auth/login');
      }
      fetchAppointments(token);
      formatDate();
    };

    checkTokenAndFetchAppointments();
  }, [router]);

  const fetchAppointments = async (token) => {
    try {
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
  const formatDate = (date) => {
    // Create a Date object from the input UTC date
    const dateObj = new Date(date);

    // Adjust the time by subtracting 4 hours to convert from UTC to your local time (UTC-4)
    dateObj.setHours(dateObj.getHours() - 4);

    // Use toLocaleString to format the date in your local time zone
    return dateObj.toLocaleString('en-US');
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2">
        <div className="order-last md:order-first md:w-4/6 md:pr-4">
          <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
            Welcome to FoodLink, {userName}!
          </h1>
          <p className="text-lg text-gray-700 text-center md:text-left mb-4">
            Your User ID: <span className="font-mono font-bold">{userId}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => router.push('/dashboard/individual/manageAppointments/book')}
            >
              Book an Appointment
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => router.push('/dashboard/individual/findFoodBank')}
            >
              Find Nearby Food Banks
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              onClick={() => router.push('/dashboard/individual/manageAppointments/view')}
            >
              View Appointments History
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : appointments.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700">
                {appointments.map((appt) => (
                  <li key={appt._id}>
                    {formatDate(appt.start_time)} - {formatDate(appt.end_time)} -
                    {foodbankUsernames[appt.foodbank_id] || 'Loading...'}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No upcoming appointments.</p>
            )}
          </div>
        </div>

        <div className="md:w-2/6 flex flex-col justify-center items-center">
          <Image
            src={foodbank}
            alt="Food Bank"
            className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
          />
          <div className="mt-6 text-center text-gray-600">
            <p className="text-md font-semibold">
              Providing food support for individuals and families in need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
