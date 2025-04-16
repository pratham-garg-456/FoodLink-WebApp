import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import validateToken from '../../../utils/validateToken';
import axios from 'axios';
import Image from 'next/image';
import foodbank from '../../../../public/images/food-bank2.jpg';

const FoodbankDashboard = ({ userRole }) => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [mealCount, setMealCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);

  const [animatedAppointmentCount, setAnimatedAppointmentCount] = useState(0);
  const [animatedMealCount, setAnimatedMealCount] = useState(0);
  const [animatedVolunteerCount, setAnimatedVolunteerCount] = useState(0);

  const animateCounter = (targetValue, setAnimatedValue) => {
    let currentValue = 0;
    const increment = Math.ceil(targetValue / 50); // Adjust speed by changing the divisor
    const interval = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(interval);
      }
      setAnimatedValue(currentValue);
    }, 20); // Adjust interval duration for smoother animation
  };

  const getUsername = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
      );
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const users = data.users;
      const matchedUser = users.find((user) => user.id === userId);
      return matchedUser ? matchedUser.name : userId.slice(0, 5);
    } catch (error) {
      console.error('Error fetching users:', error);
      return 'Guest';
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/volunteer-applications?status=approved`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setVolunteerCount(res.data.applications.length || 0);
    } catch (error) {
      setVolunteerCount(0);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const decodedToken = await validateToken(token);
      console.log('Decoded Token:', decodedToken);
      if (decodedToken.error) {
        console.error('Invalid token: ', decodedToken.error);
        router.push('/auth/login');
        return;
      }
      setUserId(decodedToken.user.id);

      const username = await getUsername(decodedToken.user.id);
      setUserName(username);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/foodbank/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.status === 'success') {
          const scheduledCount =
            response.data.appointments.filter((appointment) => appointment.status === 'scheduled')
              .length || 0;
          setAppointmentCount(scheduledCount);
          animateCounter(scheduledCount, setAnimatedAppointmentCount);

          const pickedAppointments = response.data.appointments.filter(
            (appointment) => appointment.status === 'picked'
          );
          if (pickedAppointments.length > 0) {
            let sum = 0;
            pickedAppointments.forEach((appointment) => {
              appointment.product.forEach((product) => {
                sum += product.quantity;
              });
            });
            setMealCount(sum);
            animateCounter(sum, setAnimatedMealCount);
          } else {
            setMealCount(0);
            animateCounter(0, setAnimatedMealCount);
          }
        } else {
          setAppointmentCount(0);
          animateCounter(0, setAnimatedAppointmentCount);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        router.push('/auth/login');
        return;
      }
    };
    checkToken();
  }, [router]);

  useEffect(() => {
    fetchApplications();
  }, [router]);

  useEffect(() => {
    animateCounter(volunteerCount, setAnimatedVolunteerCount);
  }, [volunteerCount]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2">
        {/* Left Section */}
        <div className="order-last md:order-first md:w-4/6 md:pr-4">
          <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
            {userName ? `Welcome ${userName} to the dashboard` : 'Welcome to the dashboard'}
          </h1>
          <p className="text-lg text-gray-700 text-center md:text-left mb-4">
            Your User ID: <span className="font-mono font-bold">{userId}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => router.push('/dashboard/foodbank/inventory')}
            >
              Manage Inventory
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => router.push('/dashboard/foodbank/events')}
            >
              Manage Events
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              onClick={() => router.push('/dashboard/foodbank/manageAppointments')}
            >
              Manage Appointments
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              onClick={() => router.push('/dashboard/foodbank/manageVolunteer')}
            >
              Manage Volunteers
            </button>
            <button
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              onClick={() => router.push('/dashboard/foodbank/manageDonations')}
            >
              Manage Donations
            </button>
            <button
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              onClick={() => router.push('/dashboard/foodbank/job')}
            >
              Manage Jobs
            </button>
          </div>

          <div className="mt-8 text-md text-gray-800 flex flex-col items-center md:justify-start md:items-start md:flex-row md:gap-4">
            <p>
              <strong>{animatedAppointmentCount}</strong> Appointments Scheduled
            </p>
            <p>
              <strong>{animatedVolunteerCount}</strong> Volunteers Engaged
            </p>
            <p>
              <strong>{animatedMealCount}</strong> Meals Distributed
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-2/6 flex flex-col justify-center items-center">
          <Image
            src={foodbank}
            alt="Food Bank"
            className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
          />
          <div className="mt-6 text-center text-gray-600">
            <p className="text-md font-semibold">
              Supporting communities through food and resources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodbankDashboard;
